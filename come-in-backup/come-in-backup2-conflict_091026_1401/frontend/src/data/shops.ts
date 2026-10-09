// Local demo shop directory for Come In app.
//
// NOTE (backend status): Backend MONGO_URL/DB_NAME are missing in the
// protected environment, so there is no live Shops API yet. These demo
// entries let the frontend ship a complete, honest customer flow and will
// be replaced by API responses once the backend is unblocked. All phone
// numbers below are reserved-for-fiction (555-01xx) so the Call Shop
// button is wired to a real tel: intent without pretending to be a real
// business line.

import { PRODUCTS, Product } from "@/src/data/catalog";

export type ShopType = "online" | "offline" | "both";

export type Shop = {
  id: string;
  name: string;
  tagline: string;
  type: ShopType;
  categoryIds: string[];
  area: string;
  address: string;
  phone: string;        // E.164 reserved-for-fiction, dialable
  image: string;
  openNow: boolean;
  hours: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  productIds: string[];
};

export const SHOPS: Shop[] = [
  {
    id: "sh-green-basket",
    name: "Green Basket Mart",
    tagline: "Fresh groceries & dairy, delivered",
    type: "online",
    categoryIds: ["atta-rice-dal", "dairy-breakfast", "fruits-veggies"],
    area: "Sector 17, Chandigarh",
    address: "Shop 24, Sector 17 Market, Chandigarh",
    phone: "+15550100",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    openNow: true,
    hours: "8:00 AM – 10:00 PM",
    deliveryAvailable: true,
    pickupAvailable: true,
    productIds: ["p1", "p2", "p4", "p6", "p7", "p8", "p9", "p10"],
  },
  {
    id: "sh-corner-store",
    name: "Krishna Corner Store",
    tagline: "Everyday essentials near you",
    type: "offline",
    categoryIds: ["snacks", "beverages", "household"],
    area: "Model Town, Delhi",
    address: "B-14, Model Town Block B, Delhi",
    phone: "+15550101",
    image:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    openNow: true,
    hours: "7:30 AM – 11:00 PM",
    deliveryAvailable: false,
    pickupAvailable: true,
    productIds: ["p11", "p12", "p13", "p15", "p16"],
  },
  {
    id: "sh-quick-bites",
    name: "Quick Bites Bazaar",
    tagline: "Snacks, drinks & munchies in 15 mins",
    type: "online",
    categoryIds: ["snacks", "beverages"],
    area: "Cyber City, Gurugram",
    address: "Tower 3, Shop 7, Cyber City, Gurugram",
    phone: "+15550102",
    image:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    openNow: false,
    hours: "9:00 AM – 9:00 PM",
    deliveryAvailable: true,
    pickupAvailable: false,
    productIds: ["p11", "p12", "p13", "p14"],
  },
  {
    id: "sh-village-dairy",
    name: "Village Dairy House",
    tagline: "Local dairy, visit for the freshest picks",
    type: "offline",
    categoryIds: ["dairy-breakfast"],
    area: "Koramangala, Bengaluru",
    address: "80ft Road, 5th Block, Koramangala, Bengaluru",
    phone: "+15550103",
    image:
      "https://images.unsplash.com/photo-1634141510639-d691d86f47be?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    openNow: true,
    hours: "6:00 AM – 9:00 PM",
    deliveryAvailable: false,
    pickupAvailable: true,
    productIds: ["p2", "p6", "p7"],
  },
  {
    id: "sh-masala-mandi",
    name: "Masala Mandi",
    tagline: "Masalas, oils & staples — online + in-store",
    type: "both",
    categoryIds: ["masalas-oils", "atta-rice-dal"],
    area: "Jubilee Hills, Hyderabad",
    address: "Road 36, Jubilee Hills, Hyderabad",
    phone: "+15550104",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    openNow: true,
    hours: "8:00 AM – 10:30 PM",
    deliveryAvailable: true,
    pickupAvailable: true,
    productIds: ["p3", "p19", "p20", "p1", "p4", "p5"],
  },
  {
    id: "sh-wellness-shelf",
    name: "Wellness Shelf",
    tagline: "Personal care, visit our locality shop",
    type: "offline",
    categoryIds: ["personal-care"],
    area: "Vastrapur, Ahmedabad",
    address: "Opp. Vastrapur Lake, Ahmedabad",
    phone: "+15550105",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    openNow: false,
    hours: "9:30 AM – 9:00 PM",
    deliveryAvailable: false,
    pickupAvailable: true,
    productIds: ["p17", "p18"],
  },
];

export function getShopById(id: string): Shop | undefined {
  return SHOPS.find((s) => s.id === id);
}

export function getShopProducts(shop: Shop): Product[] {
  return shop.productIds
    .map((pid) => PRODUCTS.find((p) => p.id === pid))
    .filter((p): p is Product => Boolean(p));
}

export type ShopFilter = {
  type?: "all" | ShopType;
  query?: string;
  categoryId?: string;
  openNowOnly?: boolean;
  deliveryOnly?: boolean;
};

export function filterShops({
  type = "all",
  query = "",
  categoryId,
  openNowOnly = false,
  deliveryOnly = false,
}: ShopFilter): Shop[] {
  const q = query.trim().toLowerCase();
  return SHOPS.filter((s) => {
    if (type === "online" && s.type === "offline") return false;
    if (type === "offline" && s.type === "online") return false;
    if (openNowOnly && !s.openNow) return false;
    if (deliveryOnly && !s.deliveryAvailable) return false;
    if (categoryId && !s.categoryIds.includes(categoryId)) return false;
    if (!q) return true;
    const haystack = `${s.name} ${s.tagline} ${s.area} ${s.address}`.toLowerCase();
    if (haystack.includes(q)) return true;
    return getShopProducts(s).some(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  });
}
