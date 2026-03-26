'use client';
import { useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function CategoryContent({ products }: { products: any[] }) {
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");

  const subcategories = Array.from(new Set(products.map((p) => p.subcategory))).sort() as string[];

  const filtered = activeSubcategory === "all"
    ? products
    : products.filter((p) => p.subcategory === activeSubcategory);

  return (
    <div className="container py-12">
      <div className="flex flex-wrap gap-2 mb-12">
        <button
          onClick={() => setActiveSubcategory("all")}
          className={`px-6 py-2.5 text-[10px] tracking-[0.1em] uppercase font-body border transition-all ${
            activeSubcategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
          }`}
        >
          All Products
        </button>
        {subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubcategory(sub)}
            className={`px-6 py-2.5 text-[10px] tracking-[0.1em] uppercase font-body border transition-all ${
              activeSubcategory === sub
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-8">
        {filtered.length} products
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <p className="text-muted-foreground font-body text-sm">No products found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
