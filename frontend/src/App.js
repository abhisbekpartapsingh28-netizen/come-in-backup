import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import { Search, MapPin, ShoppingBag, ChevronRight, Zap, Package, Home, Grid2X2, UserRound } from "lucide-react";
import { categories, products, services, shops } from "@/data/comeInCatalog";
import { ComeInProductCard } from "@/components/ComeInProductCard";
import { CategoriesScreen } from "@/screens/CategoriesScreen";
import { CategoryDetailScreen } from "@/screens/CategoryDetailScreen";
import { ProductDetailScreen } from "@/screens/ProductDetailScreen";
import { CartScreen } from "@/screens/CartScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { DeliveryAddressScreen } from "@/screens/DeliveryAddressScreen";
import { AccountScreen } from "@/screens/AccountScreen";
import comeInLogo from "@/assets/come-in-logo.svg";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "categories", label: "Categories", icon: Grid2X2 },
  { id: "search", label: "Search", icon: Search },
  { id: "cart", label: "Cart", icon: ShoppingBag },
  { id: "account", label: "Account", icon: UserRound },
];

const QTY_KEY = "comeIn:cart";
const ADDR_KEY = "comeIn:address";

function SectionHeading({ title, action, onAction }) {
  const anchor = title.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="section-heading">
      <h2 data-testid={`section-${anchor}`}>{title}</h2>
      <button type="button" className="see-all" data-testid={`see-all-${anchor}`} onClick={onAction}>
        {action}<ChevronRight size={16} />
      </button>
    </div>
  );
}

function HomeScreen({ quantities, setQuantity, go }) {
  const quickProducts = products.slice(1, 5);
  const popularProducts = products.slice(0, 4);
  return (
    <main className="home-content" data-testid="come-in-home-screen">
      <section className="hero" data-testid="home-hero">
        <img src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=1400&q=85" alt="Fresh organic vegetables" />
        <div className="hero-overlay">
          <span className="hero-pill" data-testid="hero-pill">Limited time</span>
          <h1>Fresh finds, delivered<br />to your door.</h1>
          <p>Everyday essentials from shops you know and love.</p>
          <button type="button" className="hero-cta" data-testid="hero-shop-now" onClick={() => go({ tab: "categories" })}>
            Shop now <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <SectionHeading title="Shops near you" action="See all" onAction={() => go({ tab: "categories" })} />
      <section className="shop-row" data-testid="shops-near-you">
        {shops.map((shop) => (
          <article className="shop-card" key={shop.id} data-testid={`shop-card-${shop.id}`}>
            <img src={shop.image} alt="" />
            <div>
              <h3>{shop.name}</h3>
              <p>{shop.detail}</p>
              <span>{shop.area} · Open now</span>
            </div>
          </article>
        ))}
      </section>

      <SectionHeading title="Shop by category" action="See all" onAction={() => go({ tab: "categories" })} />
      <section className="category-row" data-testid="home-categories">
        {categories.map((category) => (
          <button type="button" className="category-tile" style={{ "--tile-tint": category.tint }} key={category.id} data-testid={`category-${category.id}`} onClick={() => go({ tab: "categories", categoryId: category.id })}>
            <img src={category.image} alt="" />
            <span>{category.name}</span>
          </button>
        ))}
      </section>

      <div className="quick-heading">
        <span className="quick-badge" data-testid="quick-delivery-badge"><Zap size={13} /> 15 min</span>
        <h2 data-testid="quick-delivery-title">Quick delivery</h2>
      </div>
      <section className="product-row" data-testid="quick-delivery-products">
        {quickProducts.map((product) => (
          <ComeInProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onQuantityChange={(next) => setQuantity(product.id, next)}
            onOpen={() => go({ tab: "product", productId: product.id })}
          />
        ))}
      </section>

      <SectionHeading title="Popular products" action="Browse all" onAction={() => go({ tab: "categories" })} />
      <section className="product-grid" data-testid="popular-products">
        {popularProducts.map((product) => (
          <ComeInProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onQuantityChange={(next) => setQuantity(product.id, next)}
            onOpen={() => go({ tab: "product", productId: product.id })}
          />
        ))}
      </section>

      <SectionHeading title="Home services" action="Explore" onAction={() => go({ tab: "account" })} />
      <section className="service-row" data-testid="home-services">
        {services.map((service) => (
          <article className="service-card" key={service.id} data-testid={`service-card-${service.id}`}>
            <img src={service.image} alt="" />
            <div>
              <h3>{service.name}</h3>
              <p>{service.detail}</p>
              <strong>{service.price}</strong>
            </div>
          </article>
        ))}
      </section>
      <button type="button" className="request-card" data-testid="request-anything-card" onClick={() => go({ tab: "account" })}>
        <span className="request-icon"><Package size={20} /></span>
        <span><strong>Request anything</strong><small>Need a pickup, drop-off, or a hard-to-find item?</small></span>
        <ChevronRight size={20} />
      </button>
    </main>
  );
}

function loadStoredJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function App() {
  const [tab, setTab] = useState("home");
  const [previousTab, setPreviousTab] = useState("home");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [initialSearch, setInitialSearch] = useState("");
  const [quantities, setQuantities] = useState(() => loadStoredJSON(QTY_KEY, {}));
  const [address, setAddress] = useState(() => loadStoredJSON(ADDR_KEY, null));

  useEffect(() => {
    try { window.localStorage.setItem(QTY_KEY, JSON.stringify(quantities)); } catch (_) {}
  }, [quantities]);
  useEffect(() => {
    try {
      if (address) window.localStorage.setItem(ADDR_KEY, JSON.stringify(address));
      else window.localStorage.removeItem(ADDR_KEY);
    } catch (_) {}
  }, [address]);

  const cartCount = useMemo(() => Object.values(quantities).reduce((sum, count) => sum + count, 0), [quantities]);
  const setQuantity = (id, value) => setQuantities((current) => ({ ...current, [id]: value }));

  function go({ tab: nextTab, categoryId, productId, query }) {
    if (categoryId !== undefined) setSelectedCategoryId(categoryId);
    if (productId !== undefined) setSelectedProductId(productId);
    if (query !== undefined) setInitialSearch(query);
    if (nextTab) {
      if (["home", "categories", "search", "cart", "account"].includes(tab)) setPreviousTab(tab);
      setTab(nextTab);
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const locationLabel = address
    ? `${address.label} · ${address.city}`
    : "Set delivery location";

  function renderContent() {
    if (tab === "home") return <HomeScreen quantities={quantities} setQuantity={setQuantity} go={go} />;
    if (tab === "categories") {
      if (selectedCategoryId) {
        return (
          <CategoryDetailScreen
            categoryId={selectedCategoryId}
            quantities={quantities}
            setQuantity={setQuantity}
            openProduct={(id) => go({ tab: "product", productId: id })}
            onBack={() => setSelectedCategoryId(null)}
          />
        );
      }
      return <CategoriesScreen openCategory={(id) => go({ tab: "categories", categoryId: id })} />;
    }
    if (tab === "search") {
      return (
        <SearchScreen
          initialQuery={initialSearch}
          quantities={quantities}
          setQuantity={setQuantity}
          openProduct={(id) => go({ tab: "product", productId: id })}
          openCategory={(id) => go({ tab: "categories", categoryId: id })}
        />
      );
    }
    if (tab === "cart") {
      return (
        <CartScreen
          quantities={quantities}
          setQuantity={setQuantity}
          address={address}
          openAddress={() => setTab("address")}
          openCategories={() => go({ tab: "categories" })}
        />
      );
    }
    if (tab === "address") {
      return (
        <DeliveryAddressScreen
          address={address}
          saveAddress={(value) => { setAddress(value); }}
          onBack={() => setTab("cart")}
        />
      );
    }
    if (tab === "product") {
      return (
        <ProductDetailScreen
          productId={selectedProductId}
          quantities={quantities}
          setQuantity={setQuantity}
          openProduct={(id) => go({ tab: "product", productId: id })}
          openCart={() => setTab("cart")}
          onBack={() => setTab(selectedCategoryId ? "categories" : "home")}
        />
      );
    }
    if (tab === "account") return <AccountScreen address={address} openAddress={() => setTab("address")} />;
    return null;
  }

  const activeBottomTab = ["home", "categories", "search", "cart", "account"].includes(tab)
    ? tab
    : (tab === "address" ? "cart" : (previousTab || "home"));

  return (
    <div className="come-in-app">
      <header className="site-header">
        <div className="header-inner">
          <button type="button" className="logo-button" onClick={() => go({ tab: "home" })} data-testid="come-in-logo-button" aria-label="Come In home">
            <img className="come-in-logo" src={comeInLogo} alt="Come In — Your Town, At Your Door" data-testid="come-in-logo" />
          </button>
          <button type="button" className="location-button" data-testid="location-selector" onClick={() => setTab("address")}>
            <MapPin size={16} />
            <span><small>Deliver to</small><strong>{locationLabel}</strong></span>
            <ChevronRight size={16} />
          </button>
          <label className="global-search" data-testid="home-search-bar">
            <Search size={18} />
            <input
              aria-label="Search Come In"
              placeholder="Search groceries, shops, and more"
              value={initialSearch}
              onChange={(event) => setInitialSearch(event.target.value)}
              onFocus={() => setTab("search")}
              data-testid="header-search-input"
            />
          </label>
          <button type="button" className="cart-button" data-testid="header-cart-button" onClick={() => setTab("cart")}>
            <ShoppingBag size={19} /><span data-testid="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>
      <div className="page-shell">{renderContent()}</div>
      <nav className="bottom-nav" data-testid="main-navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={activeBottomTab === id ? "nav-item active" : "nav-item"}
            data-testid={`nav-${id}`}
            onClick={() => {
              if (id === "categories") setSelectedCategoryId(null);
              setTab(id);
            }}
          >
            <Icon size={18} />
            <span>{label}{id === "cart" && cartCount > 0 ? ` · ${cartCount}` : ""}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
