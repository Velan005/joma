'use client';
import Image from 'next/image';
import { useState, useMemo } from "react";
import { useParams } from 'next/navigation';;
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryKids from "@/assets/category-kids.jpg";

const banners: Record<string, { image: any; title: string; subtitle: string }> = {
  women: { image: categoryWomen, title: "Women", subtitle: "Effortless elegance for every occasion" },
  men: { image: categoryMen, title: "Men", subtitle: "Modern essentials, refined style" },
  kids: { image: categoryKids, title: "Kids", subtitle: "Comfortable style for little ones" },
};

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const banner = banners[category || ""];
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [category]
  );

  const subcategories = useMemo(
    () => Array.from(new Set(categoryProducts.map((p) => p.subcategory))).sort(),
    [categoryProducts]
  );

  const filtered = useMemo(
    () =>
      activeSubcategory === "all"
        ? categoryProducts
        : categoryProducts.filter((p) => p.subcategory === activeSubcategory),
    [categoryProducts, activeSubcategory]
  );

  if (!banner) {
    return <div className="container py-20 text-center font-body text-muted-foreground">Category not found.</div>;
  }

  return (
    <>
      <section className="relative h-[50vh] overflow-hidden">
        <Image src={banner.image} alt={banner.title} className="w-full h-full object-cover" layout="responsive" width={500} height={500} />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl text-background mb-2">{banner.title}</h1>
            <p className="text-background/70 font-body text-sm">{banner.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <div className="container py-12">
        {/* Subcategory filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveSubcategory("all")}
            className={`px-4 py-2 text-xs tracking-[0.1em] uppercase font-body border transition-colors ${
              activeSubcategory === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            All ({categoryProducts.length})
          </button>
          {subcategories.map((sub) => {
            const count = categoryProducts.filter((p) => p.subcategory === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase font-body border transition-colors ${
                  activeSubcategory === sub
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {sub} ({count})
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground font-body mb-8">{filtered.length} products</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-20">No products in this category yet.</p>
        )}
      </div>
    </>
  );
};

export default Category;
