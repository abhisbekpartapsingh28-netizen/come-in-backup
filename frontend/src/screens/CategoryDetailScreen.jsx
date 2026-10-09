import { ChevronLeft } from "lucide-react";
import { categories, products } from "@/data/comeInCatalog";
import { ComeInProductCard } from "@/components/ComeInProductCard";

export function CategoryDetailScreen({ categoryId, quantities, setQuantity, openProduct, onBack }) {
  const category = categories.find((item) => item.id === categoryId);
  const list = products.filter((item) => item.categoryId === categoryId);
  if (!category) return null;
  return (
    <main className="category-detail-screen" data-testid="category-detail-screen">
      <button type="button" className="back-button" data-testid="category-back" onClick={onBack}>
        <ChevronLeft size={16} /> Back
      </button>
      <div className="screen-header">
        <h1 data-testid="category-detail-title">{category.name}</h1>
        <p>{list.length} products available</p>
      </div>
      {list.length === 0 ? (
        <div className="empty-state" data-testid="category-empty"><p>Nothing here yet. Please check another category.</p></div>
      ) : (
        <section className="product-grid" data-testid="category-products">
          {list.map((product) => (
            <ComeInProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] || 0}
              onQuantityChange={(next) => setQuantity(product.id, next)}
              onOpen={() => openProduct(product.id)}
            />
          ))}
        </section>
      )}
    </main>
  );
}
