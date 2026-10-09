import { ChevronLeft, Minus, Plus, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { products, categories } from "@/data/comeInCatalog";
import { ComeInProductCard } from "@/components/ComeInProductCard";

export function ProductDetailScreen({ productId, quantities, setQuantity, openProduct, openCart, onBack }) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return (
      <main className="product-detail-screen" data-testid="product-detail-missing">
        <button type="button" className="back-button" onClick={onBack}><ChevronLeft size={16} /> Back</button>
        <div className="empty-state"><p>Product unavailable. Please try another.</p></div>
      </main>
    );
  }
  const quantity = quantities[product.id] || 0;
  const category = categories.find((item) => item.id === product.categoryId);
  const related = products.filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 4);
  const savings = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;

  return (
    <main className="product-detail-screen" data-testid="product-detail-screen">
      <button type="button" className="back-button" data-testid="product-back" onClick={onBack}><ChevronLeft size={16} /> Back</button>
      <div className="product-detail-layout">
        <div className="product-detail-image-wrap">
          <img src={product.image} alt={product.name} data-testid="product-detail-image" />
          {savings > 0 && <span className="product-detail-save" data-testid="product-detail-save">Save ₹{savings}</span>}
        </div>
        <div className="product-detail-info">
          <small data-testid="product-detail-category">{category?.name}</small>
          <h1 data-testid="product-detail-name">{product.name}</h1>
          <p className="product-detail-brand" data-testid="product-detail-brand">By {product.brand} · {product.unit}</p>
          <div className="product-detail-price-row">
            <strong data-testid="product-detail-price">₹{product.price}</strong>
            {product.mrp && product.mrp > product.price && <span className="product-detail-mrp" data-testid="product-detail-mrp">₹{product.mrp}</span>}
          </div>
          <p className="product-detail-description" data-testid="product-detail-description">{product.description}</p>

          <div className="product-detail-perks">
            <div data-testid="product-perk-delivery"><Truck size={16} /><span>Delivered in 15 min</span></div>
            <div data-testid="product-perk-quality"><ShieldCheck size={16} /><span>100% quality assured</span></div>
          </div>

          <div className="product-detail-actions">
            {quantity > 0 ? (
              <div className="quantity-control large" data-testid="product-detail-qty-control">
                <button type="button" aria-label="Remove one" data-testid="product-detail-minus" onClick={() => setQuantity(product.id, Math.max(0, quantity - 1))}><Minus size={16} /></button>
                <span data-testid="product-detail-quantity">{quantity}</span>
                <button type="button" aria-label="Add one" data-testid="product-detail-plus" onClick={() => setQuantity(product.id, quantity + 1)}><Plus size={16} /></button>
              </div>
            ) : (
              <button type="button" className="add-to-cart-button" data-testid="product-detail-add" onClick={() => setQuantity(product.id, 1)}>
                <ShoppingBag size={16} /> Add to cart
              </button>
            )}
            <button type="button" className="go-to-cart-button" data-testid="product-detail-go-cart" onClick={openCart}>Go to cart</button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h2 className="related-heading" data-testid="related-heading">You might also like</h2>
          <section className="product-grid" data-testid="related-products">
            {related.map((item) => (
              <ComeInProductCard
                key={item.id}
                product={item}
                quantity={quantities[item.id] || 0}
                onQuantityChange={(next) => setQuantity(item.id, next)}
                onOpen={() => openProduct(item.id)}
              />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
