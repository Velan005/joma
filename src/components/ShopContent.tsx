"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLOR_OPTIONS = ["Black", "White", "Cream", "Navy", "Grey", "Beige", "Camel"];
const PRICE_RANGES = [
  { label: "Under ₹500",       min: 0,    max: 500   },
  { label: "₹500 – ₹1,000",   min: 500,  max: 1000  },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000  },
  { label: "Over ₹2,000",      min: 2000, max: 100000 },
];

export default function ShopContent({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get current filter states from URL
  const category = searchParams.get("category") || "all";
  const selectedSizes = searchParams.get("sizes")?.split(",") || [];
  const selectedColors = searchParams.get("colors")?.split(",") || [];
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sort") || "newest";
  const searchQuery = searchParams.get("search") || "";

  const updateFilters = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (key: string, value: string) => {
    const current = searchParams.get(key)?.split(",") || [];
    const next = current.includes(value) 
      ? current.filter(v => v !== value) 
      : [...current, value];
    
    updateFilters({ [key]: next.length ? next.join(",") : null });
  };

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-y-2 mb-6">
        <h1 className="font-display text-2xl md:text-4xl">
          {searchQuery ? `Results for "${searchQuery}"` : "Shop All"}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="bg-transparent text-xs tracking-[0.1em] uppercase font-body border border-border px-2 py-2 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase font-body border border-border px-2 py-2 min-h-[40px] lg:hidden"
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
                  onClick={() => updateFilters({ category: cat })}
                  className={`text-sm font-body text-left capitalize ${
                    category === cat ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleFilter("sizes", size)}
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
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleFilter("colors", color)}
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
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => updateFilters({ 
                    minPrice: minPrice === String(range.min) ? null : String(range.min),
                    maxPrice: maxPrice === String(range.max) ? null : String(range.max)
                  })}
                  className={`text-sm font-body text-left ${
                    minPrice === String(range.min) ? "font-medium" : "text-muted-foreground"
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
          <p className="text-sm text-muted-foreground font-body mb-6">{initialProducts.length} products</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 [@media(max-width:340px)]:grid-cols-1">
            {initialProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
          {initialProducts.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-20">
              No products match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
