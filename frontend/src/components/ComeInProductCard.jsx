import { Minus, Plus } from "lucide-react";

export function ComeInProductCard({ product, quantity = 0, onQuantityChange, onOpen }) {
  const handleOpen = (event) => {
    if (!onOpen) return;
    if (event.target.closest(".quantity-control")) return;
    onOpen();
  };
  return (
    <article
      className="product-card"
      data-testid={`product-card-${product.id}`}
      onClick={onOpen ? handleOpen : undefined}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={onOpen ? (event) => { if (event.key === "Enter") onOpen(); } : undefined}
    >
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" data-testid={`product-image-${product.id}`} />
        <div className="product-badge" data-testid={`product-badge-${product.id}`}>Fresh pick</div>
      </div>
      <div className="product-info">
        <p className="product-brand" data-testid={`product-brand-${product.id}`}>{product.brand}</p>
        <h3 data-testid={`product-name-${product.id}`}>{product.name}</h3>
        <p className="product-unit" data-testid={`product-unit-${product.id}`}>{product.unit}</p>
        <div className="product-bottom-row">
          <div className="product-price-stack">
            <strong data-testid={`product-price-${product.id}`}>₹{product.price}</strong>
            {product.mrp && product.mrp > product.price && (
              <span className="product-mrp" data-testid={`product-mrp-${product.id}`}>₹{product.mrp}</span>
            )}
          </div>
          <div className="quantity-control" data-testid={`quantity-control-${product.id}`}>
            {quantity > 0 && <button type="button" aria-label={`Remove one ${product.name}`} data-testid={`product-minus-${product.id}`} onClick={() => onQuantityChange(Math.max(0, quantity - 1))}><Minus size={14} /></button>}
            <span data-testid={`product-quantity-${product.id}`}>{quantity || "Add"}</span>
            <button type="button" aria-label={`Add one ${product.name}`} data-testid={`product-plus-${product.id}`} onClick={() => onQuantityChange(quantity + 1)}><Plus size={14} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
