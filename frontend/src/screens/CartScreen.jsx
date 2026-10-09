import { Minus, Plus, Trash2, Tag, MapPin, ChevronRight } from "lucide-react";
import { products } from "@/data/comeInCatalog";

export function CartScreen({ quantities, setQuantity, address, openAddress, openCategories }) {
  const items = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: products.find((item) => item.id === id), quantity: qty }))
    .filter((entry) => entry.product);

  const subtotal = items.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 299 ? 0 : 29;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <main className="cart-screen" data-testid="cart-screen">
        <div className="screen-header"><h1 data-testid="cart-title">Your cart</h1></div>
        <div className="empty-state" data-testid="cart-empty">
          <p>Your cart is empty. Add fresh picks to get started.</p>
          <button type="button" className="primary-button" data-testid="cart-browse" onClick={openCategories}>Browse categories</button>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-screen" data-testid="cart-screen">
      <div className="screen-header">
        <h1 data-testid="cart-title">Your cart</h1>
        <p>{items.length} item{items.length > 1 ? "s" : ""} ready to go</p>
      </div>

      <section className="cart-list" data-testid="cart-items">
        {items.map(({ product, quantity }) => (
          <article className="cart-item" key={product.id} data-testid={`cart-item-${product.id}`}>
            <img src={product.image} alt={product.name} />
            <div className="cart-item-info">
              <p className="cart-item-brand">{product.brand}</p>
              <h3 data-testid={`cart-item-name-${product.id}`}>{product.name}</h3>
              <small>{product.unit}</small>
              <div className="cart-item-controls">
                <div className="quantity-control" data-testid={`cart-qty-${product.id}`}>
                  <button type="button" aria-label="Remove one" data-testid={`cart-minus-${product.id}`} onClick={() => setQuantity(product.id, Math.max(0, quantity - 1))}><Minus size={14} /></button>
                  <span>{quantity}</span>
                  <button type="button" aria-label="Add one" data-testid={`cart-plus-${product.id}`} onClick={() => setQuantity(product.id, quantity + 1)}><Plus size={14} /></button>
                </div>
                <button type="button" className="cart-remove" data-testid={`cart-remove-${product.id}`} onClick={() => setQuantity(product.id, 0)}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
            <strong data-testid={`cart-line-total-${product.id}`}>₹{product.price * quantity}</strong>
          </article>
        ))}
      </section>

      <button type="button" className="cart-address-row" data-testid="cart-address-row" onClick={openAddress}>
        <span className="cart-address-icon"><MapPin size={18} /></span>
        <span className="cart-address-text">
          <small>Deliver to</small>
          <strong>{address ? address.label : "Add delivery address"}</strong>
          {address?.line && <em>{address.line}</em>}
        </span>
        <ChevronRight size={18} />
      </button>

      <section className="cart-summary" data-testid="cart-summary">
        <div className="cart-promo"><Tag size={14} /><span data-testid="cart-promo-text">{subtotal >= 299 ? "You've unlocked free delivery." : `Add ₹${299 - subtotal} more for free delivery.`}</span></div>
        <div className="cart-row"><span>Subtotal</span><span data-testid="cart-subtotal">₹{subtotal}</span></div>
        <div className="cart-row"><span>Delivery fee</span><span data-testid="cart-delivery">{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
        <div className="cart-row cart-total"><span>Total</span><span data-testid="cart-total">₹{total}</span></div>
        <button type="button" className="checkout-button" data-testid="cart-checkout" onClick={openAddress}>
          Proceed to checkout <ChevronRight size={16} />
        </button>
      </section>
    </main>
  );
}
