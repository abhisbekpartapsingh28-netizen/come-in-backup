# Come In — Product Requirements Document

Last updated: 2026-01-09

## Original Problem Statement
> Shopkeeper Profiles + Payments + Location + Maps + Orders + Delivery + Admin on top of the restored Come In Expo app. Preserve all existing UI, branding, catalog, cart, i18n and shops; add seller flows, payment scaffolding, location/directions, admin dashboard and strong role-based security — without rebuilding or claiming anything is live that isn't configured.

## Tech stack (unchanged for the frontend)
- Frontend: Expo SDK 57, expo-router (file-based), React Native Web, @tanstack/react-query, i18n context.
- Backend: FastAPI + MongoDB (Motor), bcrypt + PyJWT Bearer-token auth, Emergent Object Storage for image persistence.

## Roles
- `customer` — default on registration.
- `shopkeeper` — auto-promoted when they create a shop.
- `admin` — seeded idempotently from `backend/.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## What's been implemented (2026-01-09)

### Backend (`/app/backend/server.py`)
- JWT auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`.
- Shops: `POST /api/shops`, `GET /api/shops/mine`, `PATCH /api/shops/{id}`, `PATCH /api/shops/{id}/availability`, public `GET /api/shops` + `GET /api/shops/{id}`.
- Products: `POST /api/shops/{id}/products`, `GET /api/shops/{id}/products`, `PATCH /api/products/{id}`, `DELETE /api/products/{id}`.
- Orders: `POST /api/orders` (guest-allowed; totals re-computed server-side; stock decrement), `GET /api/orders/mine`, `GET /api/shops/{id}/orders` (seller-scoped), `PATCH /api/orders/{id}/status`.
- Requests: `POST /api/requests/anything`, `GET /api/requests/anything/mine`, `POST /api/requests/assist`.
- Admin: `GET /api/admin/shops`, `PATCH /api/admin/shops/{id}/status`, `GET /api/admin/orders`, `GET/PATCH /api/admin/requests/anything`, `GET/PATCH /api/admin/requests/assist`.
- Uploads: `POST /api/uploads/image` + `GET /api/uploads/{path}` via Emergent Object Storage (persists across deploys; 5 MB cap, image-only allowlist).
- Startup: creates indexes (unique email, shop/product/order foreign keys) and idempotently reseeds admin.
- Tests: 23/23 pytest cases pass (`/app/backend/tests/backend_test.py`).

### Frontend
- API client with Bearer-token persistence (`src/lib/api.ts`) + `resolveImage()` helper for `/api/uploads` URLs.
- `AuthProvider` in `src/store/auth.tsx`, mounted inside existing `_layout.tsx` provider stack.
- New screens: `/auth`, `/become-seller`, `/seller/products`, `/seller/orders`, `/admin`, `/checkout`, `/orders`.
- Existing screens upgraded in-place:
  - `app/(tabs)/account.tsx` — real sign-in button, Sign-out, "Open your shop" / seller rows / "Admin dashboard" based on role, Past Orders routes to `/orders`.
  - `app/(tabs)/cart.tsx` — Proceed-to-checkout navigates to `/checkout`.
  - `app/shop/[id].tsx` — merged live + seed shop detail, with Call / WhatsApp / Get-directions / Come-In-agent buttons wired. Agent-assist modal persists to the backend.
  - `app/request.tsx` — Request-Anything form persists to backend; reference ref shown on success.
  - `app/shops.tsx` — DB-approved shops merged at the top of the list; filters work across both sources.
- Theme + i18n preserved. Hindi + 10 other languages still fall back correctly for new strings.

### Scaffolded (needs user-provided keys to activate — honestly disabled in UI)
- Phone + OTP sign-in (Twilio)
- Online pay via Stripe Checkout (needs sandbox claim) and Razorpay (needs merchant keys)
- Embedded Google Maps (needs Maps JS API key — the Directions **link** fallback is live today)
- Cloudinary adapter for images (not needed; Emergent Object Storage is handling this)

## Prioritized backlog (deferred to next session)
- P1 Visible agent-assist success toast with the AG- ref (today uses `Alert.alert`).
- P1 Fine-grained stepper testids (`stepper-{id}-plus/-minus/-value`) for a11y + automation.
- P2 Add image gallery (multi-upload) to shop profile + product gallery.
- P2 Order detail screen (timeline), customer "track order" live view.
- P2 Shop/product search server-side (full-text) once lists outgrow 1 page.
- P3 Phone + OTP sign-in (Twilio playbook)
- P3 Stripe checkout + webhook (sandbox claim)
- P3 Razorpay keys + checkout
- P3 Google Maps embed + map-pin picker on shop profile

## Notes for the next agent
- Admin credentials rotate via `backend/.env` + `supervisorctl restart backend`.
- When adding new frontend screens, remember Expo Router auto-registers any `.tsx` under `app/`.
- Guest orders (no login) are supported; order rows store `customer_id: null`.
- Pre-restore archive still lives at `/app/.pre-restore-archive/` — safe to delete after user sign-off.
