// Local demo data for Come In app.

export type Product = {
  id: string;
  name: string;
  brand: string;
  unit: string;
  price: number;
  mrp?: number;
  image: string;
  categoryId: string;
  description: string;
  popular?: boolean;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  tint: string;
};

export type Service = {
  id: string;
  title: string;
  tagline: string;
  price: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "atta-rice-dal",
    name: "Atta, Rice & Dal",
    image:
      "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#FEF3C7",
  },
  {
    id: "dairy-breakfast",
    name: "Dairy & Breakfast",
    image:
      "https://images.unsplash.com/photo-1634141510639-d691d86f47be?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#D1FAE5",
  },
  {
    id: "fruits-veggies",
    name: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#DCFCE7",
  },
  {
    id: "snacks",
    name: "Snacks & Munchies",
    image:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#FEE2E2",
  },
  {
    id: "beverages",
    name: "Cold Drinks & Juices",
    image:
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#DBEAFE",
  },
  {
    id: "household",
    name: "Household & Cleaning",
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#E0E7FF",
  },
  {
    id: "personal-care",
    name: "Personal Care",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#FCE7F3",
  },
  {
    id: "masalas-oils",
    name: "Masalas & Oils",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    tint: "#FFEDD5",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aashirvaad Atta",
    brand: "Aashirvaad",
    unit: "5 kg",
    price: 280,
    mrp: 320,
    image:
      "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "atta-rice-dal",
    description:
      "Made from 100% whole wheat, Aashirvaad Atta gives you soft, fluffy rotis that stay fresh for hours.",
    popular: true,
  },
  {
    id: "p2",
    name: "Amul Taaza Toned Milk",
    brand: "Amul",
    unit: "1 L",
    price: 65,
    mrp: 68,
    image:
      "https://images.unsplash.com/photo-1634141510639-d691d86f47be?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "dairy-breakfast",
    description:
      "Pasteurized toned milk, rich in calcium and protein. Delivered fresh to your doorstep.",
    popular: true,
  },
  {
    id: "p3",
    name: "Tata Salt",
    brand: "Tata",
    unit: "1 kg",
    price: 30,
    image:
      "https://images.unsplash.com/photo-1634612831148-03a8550e1d52?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "masalas-oils",
    description:
      "India's trusted iodized salt. Essential for every kitchen, every meal.",
    popular: true,
  },
  {
    id: "p4",
    name: "India Gate Basmati Rice",
    brand: "India Gate",
    unit: "5 kg",
    price: 749,
    mrp: 820,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "atta-rice-dal",
    description:
      "Premium long-grain basmati rice, perfectly aged for aromatic biryanis and pulao.",
    popular: true,
  },
  {
    id: "p5",
    name: "Toor Dal",
    brand: "Tata Sampann",
    unit: "1 kg",
    price: 165,
    image:
      "https://images.unsplash.com/photo-1596097635121-14b63b7a0c33?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "atta-rice-dal",
    description: "Unpolished premium toor dal with high protein content.",
  },
  {
    id: "p6",
    name: "Amul Butter",
    brand: "Amul",
    unit: "500 g",
    price: 275,
    image:
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "dairy-breakfast",
    description: "Pasteurised salted butter made from fresh cream.",
  },
  {
    id: "p7",
    name: "Mother Dairy Dahi",
    brand: "Mother Dairy",
    unit: "400 g",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1571212515416-fef01fc43637?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "dairy-breakfast",
    description: "Thick and creamy dahi, perfect with every Indian meal.",
  },
  {
    id: "p8",
    name: "Fresh Tomato",
    brand: "Local Farm",
    unit: "500 g",
    price: 25,
    mrp: 35,
    image:
      "https://images.unsplash.com/photo-1546470427-227df6ee1a3b?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "fruits-veggies",
    description: "Juicy, farm-fresh tomatoes handpicked from local farms.",
    popular: true,
  },
  {
    id: "p9",
    name: "Fresh Onion",
    brand: "Local Farm",
    unit: "1 kg",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "fruits-veggies",
    description: "Everyday onions, carefully graded and cleaned.",
  },
  {
    id: "p10",
    name: "Shimla Apple",
    brand: "Fresh Picks",
    unit: "1 kg",
    price: 180,
    mrp: 220,
    image:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "fruits-veggies",
    description: "Crispy, sweet apples straight from the hills of Himachal.",
    popular: true,
  },
  {
    id: "p11",
    name: "Lay's Classic Salted",
    brand: "Lay's",
    unit: "52 g",
    price: 20,
    image:
      "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "snacks",
    description: "Crispy potato chips with a perfect pinch of salt.",
  },
  {
    id: "p12",
    name: "Parle-G Biscuits",
    brand: "Parle",
    unit: "800 g",
    price: 85,
    image:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "snacks",
    description: "The original glucose biscuit loved by generations.",
    popular: true,
  },
  {
    id: "p13",
    name: "Coca-Cola",
    brand: "Coca-Cola",
    unit: "750 ml",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "beverages",
    description: "The classic refreshing cola.",
  },
  {
    id: "p14",
    name: "Real Mixed Fruit Juice",
    brand: "Real",
    unit: "1 L",
    price: 115,
    mrp: 135,
    image:
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "beverages",
    description: "A blend of 7 real fruits with no added preservatives.",
  },
  {
    id: "p15",
    name: "Surf Excel Easy Wash",
    brand: "Surf Excel",
    unit: "1 kg",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "household",
    description: "Removes tough stains in just one wash.",
  },
  {
    id: "p16",
    name: "Vim Dishwash Bar",
    brand: "Vim",
    unit: "250 g",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "household",
    description: "Tough on grease, gentle on hands.",
  },
  {
    id: "p17",
    name: "Dove Beauty Bar",
    brand: "Dove",
    unit: "100 g",
    price: 65,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "personal-care",
    description: "¼ moisturising cream for soft, radiant skin.",
  },
  {
    id: "p18",
    name: "Colgate MaxFresh",
    brand: "Colgate",
    unit: "150 g",
    price: 90,
    image:
      "https://images.unsplash.com/photo-1559591935-c6c92c6a84a1?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "personal-care",
    description: "Freshness that lasts, with cooling crystals.",
  },
  {
    id: "p19",
    name: "Fortune Sunflower Oil",
    brand: "Fortune",
    unit: "1 L",
    price: 160,
    mrp: 180,
    image:
      "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "masalas-oils",
    description: "Light, healthy, and rich in Vitamin A, D & E.",
  },
  {
    id: "p20",
    name: "MDH Garam Masala",
    brand: "MDH",
    unit: "100 g",
    price: 85,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    categoryId: "masalas-oils",
    description: "Authentic Indian garam masala for rich, aromatic curries.",
  },
];

export const SERVICES: Service[] = [
  {
    id: "s1",
    title: "Home Cleaning",
    tagline: "Deep clean by trained pros",
    price: "₹499 onwards",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
  },
  {
    id: "s2",
    title: "Plumber on-demand",
    tagline: "Leak, tap, geyser fix",
    price: "₹149 visit",
    image: "https://images.pexels.com/photos/6195899/pexels-photo-6195899.jpeg",
  },
  {
    id: "s3",
    title: "Electrician",
    tagline: "Fans, switches, wiring",
    price: "₹149 visit",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
  },
  {
    id: "s4",
    title: "AC Service",
    tagline: "Deep service & gas refill",
    price: "₹599 onwards",
    image:
      "https://images.unsplash.com/photo-1631545308456-1839f04b4e23?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
  },
  {
    id: "s5",
    title: "Salon at home",
    tagline: "Hair, beauty, grooming",
    price: "₹299 onwards",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
  },
  {
    id: "s6",
    title: "Laundry pickup",
    tagline: "Wash & iron at your door",
    price: "₹70/kg",
    image:
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
  },
];

export const QUICK_DELIVERY_PRODUCTS = PRODUCTS.filter((p) =>
  ["p2", "p8", "p11", "p13", "p12"].includes(p.id),
);

export const POPULAR_PRODUCTS = PRODUCTS.filter((p) => p.popular);

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.unit.toLowerCase().includes(q),
  );
}
