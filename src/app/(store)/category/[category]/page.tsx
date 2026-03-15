'use client';
import Image from 'next/image';
import { useState } from "react";
import { useParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const banners: Record<string, { image: string; title: string; subtitle: string }> = {
  women: { image: "https://images.unsplash.com/photo-1483985988355-66d7445e233b?q=80&w=2070&auto=format&fit=crop", title: "Women", subtitle: "Effortless elegance for every occasion" },
  men: { image: "https://images.unsplash.com/photo-1488161628813-244aa2f87735?q=80&w=1967&auto=format&fit=crop", title: "Men", subtitle: "Modern essentials, refined style" },
  kids: { image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=2070&auto=format&fit=crop", title: "Kids", subtitle: "Comfortable style for little ones" },
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const banner = banners[category || ""] || banners.women;
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", category],
    queryFn: async () => {
      const res = await fetch(`/api/products?category=${category}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!category,
  });

  const subcategories = Array.from(new Set(products.map((p: any) => p.subcategory))).sort() as string[];

  const filtered = activeSubcategory === "all"
    ? products
    : products.filter((p: any) => p.subcategory === activeSubcategory);

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <Image src={banner.image} alt={banner.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-2">{banner.title}</h1>
            <p className="text-white/80 font-body text-xs md:text-sm tracking-[0.2em] uppercase">{banner.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <div className="container py-12">
        {/* Subcategory filter pills */}
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

        <div className="flex items-center justify-between mb-8">
           <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">{filtered.length} products</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {isLoading ? (
             [...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
             ))
          ) : filtered.length > 0 ? (
            filtered.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
               <p className="text-muted-foreground font-body text-sm">No products found for this selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
