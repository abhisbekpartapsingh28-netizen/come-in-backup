import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { products, categories } from "@/data/comeInCatalog";
import { ComeInProductCard } from "@/components/ComeInProductCard";

const trending = ["Milk", "Atta", "Rice", "Mango", "Chips", "Cola"];

export function SearchScreen({ initialQuery = "", quantities, setQuantity, openProduct, openCategory }) {
  const [query, setQuery] = useState(initialQuery);
  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!trimmed) return [];
    return products.filter((item) =>
      item.name.toLowerCase().includes(trimmed) ||
      item.brand.toLowerCase().includes(trimmed) ||
      (categories.find((c) => c.id === item.categoryId)?.name || "").toLowerCase().includes(trimmed)
    );
  }, [trimmed]);

  return (
    <main className="search-screen" data-testid="search-screen">
      <div className="screen-header"><h1 data-testid="search-title">Search Come In</h1></div>
      <label className="search-field" data-testid="search-input-wrap">
        <Search size={18} />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search groceries, brands, categories"
          data-testid="search-input"
          aria-label="Search Come In"
        />
      </label>

      {!trimmed && (
        <>
          <h2 className="search-section-title" data-testid="search-trending-title">Trending searches</h2>
          <div className="search-pill-row" data-testid="search-trending">
            {trending.map((term) => (
              <button type="button" key={term} className="search-pill" data-testid={`trending-${term.toLowerCase()}`} onClick={() => setQuery(term)}>{term}</button>
            ))}
          </div>
          <h2 className="search-section-title">Browse categories</h2>
          <div className="search-pill-row" data-testid="search-categories">
            {categories.map((category) => (
              <button type="button" key={category.id} className="search-pill" data-testid={`search-cat-${category.id}`} onClick={() => openCategory(category.id)}>{category.name}</button>
            ))}
          </div>
        </>
      )}

      {trimmed && results.length === 0 && (
        <div className="empty-state" data-testid="search-empty">
          <p>No matches for "{query}". Try a different term or browse categories.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="search-count" data-testid="search-count">{results.length} result{results.length > 1 ? "s" : ""} for "{query}"</p>
          <section className="product-grid" data-testid="search-results">
            {results.map((product) => (
              <ComeInProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id] || 0}
                onQuantityChange={(next) => setQuantity(product.id, next)}
                onOpen={() => openProduct(product.id)}
              />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
