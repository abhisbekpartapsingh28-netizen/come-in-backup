# Come In — Backend (FastAPI + MongoDB)
#
# Single-file server for the Come In marketplace. Everything is namespaced
# under /api/*. Auth uses Bearer JWT in the Authorization header (Expo
# React Native Web stores it in SecureStore / AsyncStorage).
#
# Roles:
#   - customer    (default on register)
#   - shopkeeper  (customer that has registered a shop)
#   - admin       (seeded from env)
#
# Images are stored on disk at /app/backend/uploads and served from
# /api/uploads/<file>. This avoids any 3rd-party dependency for the
# first delivery; a Cloudinary adapter can slot in later.

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import secrets
import mimetypes
from datetime import datetime, timezone, timedelta
from typing import Annotated, List, Optional, Literal

import bcrypt
import jwt
import requests
from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, EmailStr, Field, field_validator
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("comein")

# ---------------------------------------------------------------------------
# Mongo + uploads
# ---------------------------------------------------------------------------

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Emergent object storage (shared bucket, authenticated via EMERGENT_LLM_KEY).
# Images persist across deploys instead of living on the app pod.
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "comein"
_storage_key: Optional[str] = None


def init_storage(force: bool = False) -> Optional[str]:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY missing; uploads disabled")
        return None
    try:
        resp = requests.post(
            f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30
        )
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        return _storage_key
    except Exception as e:
        logger.error("Object storage init failed: %s", e)
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Object storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 404:
        # Stale key — mint a new one and retry once
        key = init_storage(force=True)
        if not key:
            raise HTTPException(status_code=503, detail="Object storage unavailable")
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Object storage unavailable")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        if not key:
            raise HTTPException(status_code=503, detail="Object storage unavailable")
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------------------------------------------------------------------
# Shared model helpers (BaseDocument pattern)
# ---------------------------------------------------------------------------

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now_utc().isoformat()


class BaseDoc(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


def doc_out(doc: dict) -> dict:
    """Serialize a Mongo document for JSON output: _id -> id (string)."""
    if not doc:
        return doc
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    # Never leak password hashes
    d.pop("password_hash", None)
    return d


# ---------------------------------------------------------------------------
# Password + JWT
# ---------------------------------------------------------------------------

BCRYPT_ROUNDS = 12
JWT_ALG = "HS256"
ACCESS_TTL_MIN = 60 * 24 * 7  # 7 days — mobile apps hold long-lived tokens


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    ).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, role: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "email": email,
        "type": "access",
        "exp": now_utc() + timedelta(minutes=ACCESS_TTL_MIN),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALG)


async def get_bearer_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:].strip() or None
    return None


async def get_current_user_optional(request: Request) -> Optional[dict]:
    token = await get_bearer_token(request)
    if not token:
        return None
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            return None
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            return None
        return doc_out(user)
    except (jwt.PyJWTError, Exception):
        return None


async def get_current_user(request: Request) -> dict:
    user = await get_current_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def require_role(*roles: str):
    async def _dep(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return _dep


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    token: str
    user: dict


# Shops ----------------------------------------------------------------------


class ShopIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    tagline: str = Field(default="", max_length=160)
    description: str = Field(default="", max_length=1200)
    owner_name: str = Field(default="", max_length=120)
    phone: str = Field(min_length=5, max_length=20)
    alt_phone: Optional[str] = Field(default=None, max_length=20)
    whatsapp: Optional[str] = Field(default=None, max_length=20)
    category_ids: List[str] = Field(default_factory=list)
    area: str = Field(default="", max_length=160)
    address: str = Field(default="", max_length=400)
    city: str = Field(default="", max_length=80)
    state: str = Field(default="", max_length=80)
    pincode: str = Field(default="", max_length=12)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hours: str = Field(default="", max_length=120)
    holidays: List[str] = Field(default_factory=list)
    services: List[str] = Field(default_factory=list)
    delivery_available: bool = False
    pickup_available: bool = True
    delivery_radius_km: Optional[float] = None
    payment_methods: List[str] = Field(default_factory=lambda: ["cod"])
    public_upi: Optional[str] = Field(default=None, max_length=80)
    shop_type: Literal["online", "offline", "both"] = "offline"
    image_url: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    business_registration: Optional[str] = Field(default=None, max_length=80)


# Products -------------------------------------------------------------------


class ProductIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    brand: str = Field(default="", max_length=80)
    unit: str = Field(default="", max_length=40)
    price: float = Field(ge=0)
    mrp: Optional[float] = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    image_url: Optional[str] = None
    category_id: str = Field(default="", max_length=40)
    description: str = Field(default="", max_length=1200)
    available: bool = True

    @field_validator("mrp")
    @classmethod
    def mrp_gte_price(cls, v, info):
        if v is None:
            return v
        price = info.data.get("price", 0)
        if v < price:
            raise ValueError("MRP cannot be less than selling price")
        return v


# Orders ---------------------------------------------------------------------


class CartLine(BaseModel):
    product_id: str
    name: str
    unit: str = ""
    price: float = Field(ge=0)
    qty: int = Field(ge=1)
    image_url: Optional[str] = None
    shop_id: Optional[str] = None


class OrderIn(BaseModel):
    items: List[CartLine]
    delivery_address: str = Field(min_length=1, max_length=400)
    customer_name: str = Field(default="", max_length=120)
    customer_phone: str = Field(default="", max_length=20)
    delivery_fee: float = Field(default=0, ge=0)
    payment_method: Literal["cod", "online_stripe", "online_razorpay"] = "cod"
    notes: str = Field(default="", max_length=400)
    shop_id: Optional[str] = None  # for seller-scoped orders

    @field_validator("items")
    @classmethod
    def non_empty(cls, v):
        if not v:
            raise ValueError("Order has no items")
        return v


class OrderStatusUpdate(BaseModel):
    status: Literal[
        "pending", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"
    ]
    note: str = Field(default="", max_length=240)


# Requests -------------------------------------------------------------------


class RequestAnythingIn(BaseModel):
    description: str = Field(min_length=1, max_length=1200)
    pickup: str = Field(default="", max_length=240)
    drop: str = Field(min_length=1, max_length=240)
    size: str = Field(default="Small", max_length=24)
    quantity: int = Field(default=1, ge=1)
    budget: Optional[float] = Field(default=None, ge=0)
    category: str = Field(default="", max_length=80)
    reference_image_url: Optional[str] = None
    notes: str = Field(default="", max_length=400)
    customer_name: str = Field(default="", max_length=120)
    customer_phone: str = Field(default="", max_length=20)


class AgentAssistIn(BaseModel):
    shop_id: Optional[str] = None
    reason: str = Field(min_length=1, max_length=600)
    preferred_time: str = Field(default="", max_length=80)
    instructions: str = Field(default="", max_length=600)
    customer_name: str = Field(default="", max_length=120)
    customer_phone: str = Field(default="", max_length=20)


# ---------------------------------------------------------------------------
# App + router
# ---------------------------------------------------------------------------

app = FastAPI(title="Come In API")
api = APIRouter(prefix="/api")


# Health ---------------------------------------------------------------------


@api.get("/")
async def root():
    return {"service": "come-in", "status": "ok", "time": now_iso()}


# Legacy status endpoints retained for backward compatibility -----------------


class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=now_utc)


class StatusCheckCreate(BaseModel):
    client_name: str


@api.post("/status", response_model=StatusCheck)
async def create_status_check(payload: StatusCheckCreate):
    obj = StatusCheck(**payload.model_dump())
    await db.status_checks.insert_one(obj.model_dump())
    return obj


@api.get("/status", response_model=List[StatusCheck])
async def list_status_checks():
    rows = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**r) for r in rows]


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


@api.post("/auth/register", response_model=AuthOut)
async def register(body: RegisterIn):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "name": body.name.strip(),
        "email": email,
        "phone": (body.phone or "").strip(),
        "password_hash": hash_password(body.password),
        "role": "customer",
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    res = await db.users.insert_one(user_doc)
    user_doc["_id"] = res.inserted_id
    token = create_access_token(str(res.inserted_id), "customer", email)
    return {"token": token, "user": doc_out(user_doc)}


@api.post("/auth/login", response_model=AuthOut)
async def login(body: LoginIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), user.get("role", "customer"), email)
    return {"token": token, "user": doc_out(user)}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


class UpdateProfileIn(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=20)


@api.patch("/auth/me")
async def update_me(body: UpdateProfileIn, user: dict = Depends(get_current_user)):
    patch = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not patch:
        return user
    patch["updated_at"] = now_utc()
    await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": patch})
    fresh = await db.users.find_one({"_id": ObjectId(user["id"])})
    return doc_out(fresh)


# ---------------------------------------------------------------------------
# Uploads (images)
# ---------------------------------------------------------------------------


ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


@api.post("/uploads/image")
async def upload_image(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
    if content_type not in ALLOWED_IMAGE:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WEBP/GIF images are allowed")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 5 MB)")
    ext = (mimetypes.guess_extension(content_type) or ".jpg").lstrip(".")
    if ext == "jpe":
        ext = "jpg"
    fname = f"{uuid.uuid4().hex}.{ext}"
    path = f"{APP_NAME}/uploads/{user['id']}/{fname}"
    result = put_object(path, data, content_type)
    # Keep a soft-delete friendly reference in Mongo
    await db.files.insert_one(
        {
            "storage_path": result["path"],
            "owner_id": user["id"],
            "content_type": content_type,
            "size": result.get("size", len(data)),
            "is_deleted": False,
            "created_at": now_utc(),
        }
    )
    # Frontend-facing URL always goes through the backend so we can serve
    # the right bytes + Content-Type.
    return {"url": f"/api/uploads/{result['path']}", "storage_path": result["path"]}


@api.get("/uploads/{storage_path:path}")
async def serve_upload(storage_path: str):
    if ".." in storage_path:
        raise HTTPException(status_code=400, detail="Invalid path")
    record = await db.files.find_one({"storage_path": storage_path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, ct = get_object(storage_path)
    return Response(content=data, media_type=record.get("content_type") or ct)


# ---------------------------------------------------------------------------
# Shops (shopkeeper + public)
# ---------------------------------------------------------------------------


async def _get_shop_or_404(shop_id: str) -> dict:
    try:
        oid = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Shop not found")
    shop = await db.shops.find_one({"_id": oid})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop


def _assert_shop_owner(shop: dict, user: dict):
    if user.get("role") == "admin":
        return
    if shop.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="You can only modify your own shop")


@api.post("/shops")
async def create_shop(body: ShopIn, user: dict = Depends(get_current_user)):
    """A customer creates a shop and becomes a shopkeeper."""
    # Only one active shop per owner for the MVP
    existing = await db.shops.find_one({"owner_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="You already have a shop registered")
    doc = body.model_dump()
    doc.update(
        {
            "owner_id": user["id"],
            "status": "pending",  # pending -> approved -> suspended
            "online": False,  # seller toggles after approval
            "created_at": now_utc(),
            "updated_at": now_utc(),
        }
    )
    res = await db.shops.insert_one(doc)
    doc["_id"] = res.inserted_id
    # Promote the user to shopkeeper
    if user.get("role") == "customer":
        await db.users.update_one(
            {"_id": ObjectId(user["id"])}, {"$set": {"role": "shopkeeper", "updated_at": now_utc()}}
        )
    return doc_out(doc)


@api.get("/shops/mine")
async def my_shop(user: dict = Depends(get_current_user)):
    shop = await db.shops.find_one({"owner_id": user["id"]})
    if not shop:
        return None
    return doc_out(shop)


@api.patch("/shops/{shop_id}")
async def update_shop(shop_id: str, body: ShopIn, user: dict = Depends(get_current_user)):
    shop = await _get_shop_or_404(shop_id)
    _assert_shop_owner(shop, user)
    patch = body.model_dump()
    patch["updated_at"] = now_utc()
    await db.shops.update_one({"_id": shop["_id"]}, {"$set": patch})
    fresh = await db.shops.find_one({"_id": shop["_id"]})
    return doc_out(fresh)


class ShopAvailabilityIn(BaseModel):
    online: bool


@api.patch("/shops/{shop_id}/availability")
async def set_shop_availability(
    shop_id: str, body: ShopAvailabilityIn, user: dict = Depends(get_current_user)
):
    shop = await _get_shop_or_404(shop_id)
    _assert_shop_owner(shop, user)
    if shop.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Shop must be approved before going online")
    await db.shops.update_one(
        {"_id": shop["_id"]}, {"$set": {"online": bool(body.online), "updated_at": now_utc()}}
    )
    fresh = await db.shops.find_one({"_id": shop["_id"]})
    return doc_out(fresh)


@api.get("/shops")
async def list_shops(
    type: Optional[str] = None,
    online: Optional[str] = None,
    q: Optional[str] = None,
):
    """Public list of approved shops."""
    filt: dict = {"status": "approved"}
    if type in ("online", "offline", "both"):
        filt["shop_type"] = type
    if online == "true":
        filt["online"] = True
    if online == "false":
        filt["online"] = False
    cursor = db.shops.find(filt).sort("created_at", -1)
    rows = [doc_out(r) async for r in cursor]
    if q:
        ql = q.lower()
        rows = [
            r
            for r in rows
            if ql in r.get("name", "").lower()
            or ql in r.get("area", "").lower()
            or ql in r.get("address", "").lower()
            or ql in r.get("tagline", "").lower()
        ]
    return rows


@api.get("/shops/{shop_id}")
async def get_shop(shop_id: str):
    shop = await _get_shop_or_404(shop_id)
    if shop.get("status") != "approved":
        # Owners/admins can still fetch via /shops/mine; this is the public route.
        raise HTTPException(status_code=404, detail="Shop not available")
    return doc_out(shop)


# ---------------------------------------------------------------------------
# Products (shop-scoped)
# ---------------------------------------------------------------------------


@api.post("/shops/{shop_id}/products")
async def create_product(
    shop_id: str, body: ProductIn, user: dict = Depends(get_current_user)
):
    shop = await _get_shop_or_404(shop_id)
    _assert_shop_owner(shop, user)
    doc = body.model_dump()
    doc.update(
        {
            "shop_id": shop_id,
            "owner_id": user["id"],
            "created_at": now_utc(),
            "updated_at": now_utc(),
        }
    )
    res = await db.products.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc_out(doc)


@api.get("/shops/{shop_id}/products")
async def list_shop_products(shop_id: str):
    cursor = db.products.find({"shop_id": shop_id}).sort("created_at", -1)
    return [doc_out(r) async for r in cursor]


@api.patch("/products/{product_id}")
async def update_product(
    product_id: str, body: ProductIn, user: dict = Depends(get_current_user)
):
    try:
        pid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"_id": pid})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if user.get("role") != "admin" and product.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not your product")
    patch = body.model_dump()
    patch["updated_at"] = now_utc()
    await db.products.update_one({"_id": pid}, {"$set": patch})
    fresh = await db.products.find_one({"_id": pid})
    return doc_out(fresh)


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    try:
        pid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"_id": pid})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if user.get("role") != "admin" and product.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not your product")
    await db.products.delete_one({"_id": pid})
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------


def _order_total(items: List[CartLine], delivery_fee: float) -> float:
    return round(sum(line.price * line.qty for line in items) + delivery_fee, 2)


@api.post("/orders")
async def create_order(body: OrderIn, request: Request):
    # Public endpoint (guests can place COD orders); if logged-in we tag them.
    user = await get_current_user_optional(request)
    # Compute server-side total; never trust client numbers for totals.
    total = _order_total(body.items, body.delivery_fee)
    subtotal = round(sum(line.price * line.qty for line in body.items), 2)

    # Decrement stock for products the seller actually owns.
    for line in body.items:
        try:
            pid = ObjectId(line.product_id) if line.product_id else None
        except Exception:
            pid = None
        if pid:
            prod = await db.products.find_one({"_id": pid})
            if prod and prod.get("stock", 0) >= line.qty:
                await db.products.update_one(
                    {"_id": pid}, {"$inc": {"stock": -line.qty}, "$set": {"updated_at": now_utc()}}
                )

    short_ref = f"CI-{secrets.token_hex(3).upper()}"
    doc = {
        "ref": short_ref,
        "customer_id": user["id"] if user else None,
        "customer_name": body.customer_name,
        "customer_phone": body.customer_phone,
        "delivery_address": body.delivery_address,
        "items": [line.model_dump() for line in body.items],
        "subtotal": subtotal,
        "delivery_fee": body.delivery_fee,
        "total": total,
        "payment_method": body.payment_method,
        "payment_status": "unpaid" if body.payment_method != "cod" else "cod_pending",
        "status": "pending",
        "status_history": [{"status": "pending", "at": now_utc(), "note": "Order placed"}],
        "notes": body.notes,
        "shop_id": body.shop_id,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    if body.payment_method in ("online_stripe", "online_razorpay"):
        # Online payments are scaffolded. The frontend will not expose this path
        # until credentials are configured. We return the created order with
        # payment_status=unpaid so an admin can wire the gateway later.
        doc["payment_status"] = "awaiting_gateway"
    res = await db.orders.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc_out(doc)


@api.get("/orders/mine")
async def my_orders(user: dict = Depends(get_current_user)):
    cursor = db.orders.find({"customer_id": user["id"]}).sort("created_at", -1)
    return [doc_out(r) async for r in cursor]


@api.get("/shops/{shop_id}/orders")
async def shop_orders(shop_id: str, user: dict = Depends(get_current_user)):
    shop = await _get_shop_or_404(shop_id)
    _assert_shop_owner(shop, user)
    cursor = db.orders.find({"shop_id": shop_id}).sort("created_at", -1)
    return [doc_out(r) async for r in cursor]


@api.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str, body: OrderStatusUpdate, user: dict = Depends(get_current_user)
):
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")
    order = await db.orders.find_one({"_id": oid})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Only shop owner or admin may change status.
    if user.get("role") != "admin":
        if not order.get("shop_id"):
            raise HTTPException(status_code=403, detail="Not your order")
        shop = await db.shops.find_one({"_id": ObjectId(order["shop_id"])})
        if not shop or shop.get("owner_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Not your order")
    history_entry = {"status": body.status, "at": now_utc(), "note": body.note}
    await db.orders.update_one(
        {"_id": oid},
        {
            "$set": {"status": body.status, "updated_at": now_utc()},
            "$push": {"status_history": history_entry},
        },
    )
    fresh = await db.orders.find_one({"_id": oid})
    return doc_out(fresh)


# ---------------------------------------------------------------------------
# Requests: Request-Anything + Agent assistance
# ---------------------------------------------------------------------------


@api.post("/requests/anything")
async def submit_request_anything(body: RequestAnythingIn, request: Request):
    user = await get_current_user_optional(request)
    short_ref = f"RQ-{secrets.token_hex(3).upper()}"
    doc = body.model_dump()
    doc.update(
        {
            "ref": short_ref,
            "customer_id": user["id"] if user else None,
            "status": "pending",
            "status_history": [{"status": "pending", "at": now_utc(), "note": "Request received"}],
            "created_at": now_utc(),
            "updated_at": now_utc(),
        }
    )
    res = await db.request_anything.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc_out(doc)


@api.get("/requests/anything/mine")
async def my_requests_anything(user: dict = Depends(get_current_user)):
    cursor = db.request_anything.find({"customer_id": user["id"]}).sort("created_at", -1)
    return [doc_out(r) async for r in cursor]


@api.post("/requests/assist")
async def submit_agent_assist(body: AgentAssistIn, request: Request):
    user = await get_current_user_optional(request)
    short_ref = f"AG-{secrets.token_hex(3).upper()}"
    doc = body.model_dump()
    doc.update(
        {
            "ref": short_ref,
            "customer_id": user["id"] if user else None,
            "status": "pending",
            "status_history": [{"status": "pending", "at": now_utc(), "note": "Awaiting agent"}],
            "created_at": now_utc(),
            "updated_at": now_utc(),
        }
    )
    res = await db.agent_assist.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc_out(doc)


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------


@api.get("/admin/shops")
async def admin_shops(_: dict = Depends(require_role("admin"))):
    cursor = db.shops.find().sort("created_at", -1)
    return [doc_out(r) async for r in cursor]


class ShopApprovalIn(BaseModel):
    status: Literal["approved", "suspended", "pending"]


@api.patch("/admin/shops/{shop_id}/status")
async def admin_set_shop_status(
    shop_id: str, body: ShopApprovalIn, _: dict = Depends(require_role("admin"))
):
    shop = await _get_shop_or_404(shop_id)
    await db.shops.update_one(
        {"_id": shop["_id"]},
        {"$set": {"status": body.status, "updated_at": now_utc()}},
    )
    fresh = await db.shops.find_one({"_id": shop["_id"]})
    return doc_out(fresh)


@api.get("/admin/orders")
async def admin_orders(_: dict = Depends(require_role("admin"))):
    cursor = db.orders.find().sort("created_at", -1).limit(500)
    return [doc_out(r) async for r in cursor]


@api.get("/admin/requests/anything")
async def admin_requests_anything(_: dict = Depends(require_role("admin"))):
    cursor = db.request_anything.find().sort("created_at", -1).limit(500)
    return [doc_out(r) async for r in cursor]


@api.get("/admin/requests/assist")
async def admin_agent_assist(_: dict = Depends(require_role("admin"))):
    cursor = db.agent_assist.find().sort("created_at", -1).limit(500)
    return [doc_out(r) async for r in cursor]


class RequestStatusIn(BaseModel):
    status: Literal["pending", "assigned", "in_progress", "completed", "cancelled"]
    note: str = Field(default="", max_length=240)


@api.patch("/admin/requests/anything/{req_id}/status")
async def admin_update_request(
    req_id: str, body: RequestStatusIn, _: dict = Depends(require_role("admin"))
):
    try:
        oid = ObjectId(req_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Request not found")
    item = await db.request_anything.find_one({"_id": oid})
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")
    await db.request_anything.update_one(
        {"_id": oid},
        {
            "$set": {"status": body.status, "updated_at": now_utc()},
            "$push": {"status_history": {"status": body.status, "at": now_utc(), "note": body.note}},
        },
    )
    fresh = await db.request_anything.find_one({"_id": oid})
    return doc_out(fresh)


@api.patch("/admin/requests/assist/{req_id}/status")
async def admin_update_assist(
    req_id: str, body: RequestStatusIn, _: dict = Depends(require_role("admin"))
):
    try:
        oid = ObjectId(req_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Request not found")
    item = await db.agent_assist.find_one({"_id": oid})
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")
    await db.agent_assist.update_one(
        {"_id": oid},
        {
            "$set": {"status": body.status, "updated_at": now_utc()},
            "$push": {"status_history": {"status": body.status, "at": now_utc(), "note": body.note}},
        },
    )
    fresh = await db.agent_assist.find_one({"_id": oid})
    return doc_out(fresh)


# ---------------------------------------------------------------------------
# Startup: indexes + admin seed
# ---------------------------------------------------------------------------


@app.on_event("startup")
async def _startup():
    await db.users.create_index("email", unique=True)
    await db.shops.create_index("owner_id")
    await db.shops.create_index("status")
    await db.products.create_index("shop_id")
    await db.products.create_index("owner_id")
    await db.orders.create_index("customer_id")
    await db.orders.create_index("shop_id")
    await db.files.create_index("owner_id")

    # Warm up object storage so uploads work on the first request
    try:
        init_storage()
    except Exception as e:
        logger.warning("Object storage warm-up failed: %s", e)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@comein.app")
    admin_password = os.environ.get("ADMIN_PASSWORD", "ComeIn@2026Admin")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one(
            {
                "name": "Come In Admin",
                "email": admin_email,
                "phone": "",
                "password_hash": hash_password(admin_password),
                "role": "admin",
                "created_at": now_utc(),
                "updated_at": now_utc(),
            }
        )
        logger.info("Seeded admin user %s", admin_email)
    else:
        # Keep admin credentials in sync with env on each boot
        if not verify_password(admin_password, existing.get("password_hash", "")):
            await db.users.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "password_hash": hash_password(admin_password),
                        "role": "admin",
                        "updated_at": now_utc(),
                    }
                },
            )
            logger.info("Updated admin credentials for %s", admin_email)


@app.on_event("shutdown")
async def _shutdown():
    client.close()


# ---------------------------------------------------------------------------
# Mount router + CORS
# ---------------------------------------------------------------------------

app.include_router(api)

cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_origins_env.split(",")] if cors_origins_env else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,  # Bearer tokens — no cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
