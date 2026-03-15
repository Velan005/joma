'use client';
import { useState, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

const sizes = ["XS", "S", "M", "L", "XL"];
const colorOptions = ["Black", "White", "Cream", "Navy", "Grey", "Beige", "Camel"];
const priceRanges = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $300", min: 200, max: 300 },
  { label: "Over $300", min: 300, max: Infinity },
];

const ShopInner = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", selectedCategory, searchQuery],
    queryFn: async () => {
      const url = new URL("/api/products", window.location.origin);
      if (selectedCategory !== "all") url.searchParams.set("category", selectedCategory);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    }
  });

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedSizes.length) {
       result = result.filter((p: any) => p.sizes?.some((s: string) => selectedSizes.includes(s)));
    }
    if (selectedColors.length) {
       result = result.filter((p: any) => p.colors?.some((c: any) => selectedColors.includes(typeof c === 'string' ? c : c.name)));
    }
    if (selectedPrice !== null) {
      const range = priceRanges[selectedPrice];
      result = result.filter((p: any) => p.price >= range.min && p.price < range.max);
    }
    if (sortBy === "price-asc") result.sort((a: any, b: any) => a.price - b.price);
    if (sortBy === "price-desc") result.sort((a: any, b: any) => b.price - a.price);
    return result;
  }, [products, selectedSizes, selectedColors, selectedPrice, sortBy]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  const toggleColor = (color: string) =>
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl md:text-4xl">
          {searchQuery ? `Results for "${searchQuery}"` : "Shop All"}
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs tracking-[0.1em] uppercase font-body border border-border px-3 py-2 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-xs tracking-[0.1em] uppercase font-body border border-border px-3 py-2 lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside
          className={`${
            filtersOpen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : "hidden"
          } lg:block lg:static lg:w-56 lg:shrink-0`}
        >
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="font-display text-lg">Filters</h2>
            <button onClick={() => setFiltersOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Category</h3>
            <div className="flex flex-col gap-2">
              {["all", "women", "men", "kids"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-sm font-body text-left capitalize ${
                    selectedCategory === cat ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`w-10 h-10 text-xs font-body border ${
                    selectedSizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Color</h3>
            <div className="flex flex-col gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`text-sm font-body text-left ${
                    selectedColors.includes(color) ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Price</h3>
            <div className="flex flex-col gap-2">
              {priceRanges.map((range, i) => (
                <button
                  key={range.label}
                  onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                  className={`text-sm font-body text-left ${
                    selectedPrice === i ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setFiltersOpen(false)}
            className="w-full bg-primary text-primary-foreground py-3 text-xs tracking-[0.15em] uppercase font-body lg:hidden"
          >
            Apply Filters
          </button>
        </aside>

        <div className="flex-1">
          {isLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-lg" />
                ))}
             </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-body mb-6">{filtered.length} products</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((product: any) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground font-body py-20">
                  No products match your filters.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Shop = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShopInner />
  </Suspense>
);

export default Shop;
