import { categories, products } from "@/data/comeInCatalog";

export function CategoriesScreen({ openCategory }) {
  return (
    <main className="categories-screen" data-testid="categories-screen">
      <div className="screen-header">
        <h1 data-testid="categories-title">Shop by category</h1>
        <p>Browse everyday essentials sorted by what you need.</p>
      </div>
      <section className="categories-grid" data-testid="categories-grid">
        {categories.map((category) => {
          const count = products.filter((item) => item.categoryId === category.id).length;
          return (
            <button
              type="button"
              key={category.id}
              className="category-card"
              style={{ "--tile-tint": category.tint }}
              data-testid={`category-card-${category.id}`}
              onClick={() => openCategory(category.id)}
            >
              <img src={category.image} alt="" />
              <div>
                <h3>{category.name}</h3>
                <small>{count} items</small>
              </div>
            </button>
          );
        })}
      </section>
    </main>
  );
}
