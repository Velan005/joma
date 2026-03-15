'use client';
import Image from 'next/image';
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: products = [] } = useQuery({
    queryKey: ["search-products"],
    queryFn: () => fetch("/api/products").then(res => res.json()),
    enabled: open
  });

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, products]);

  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.subcategory.toLowerCase().includes(q)) cats.add(p.subcategory);
      if (p.category.toLowerCase().includes(q)) cats.add(p.category);
    });
    return Array.from(cats).slice(0, 4);
  }, [query, products]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const goToProduct = (id: string) => {
    router.push(`/product/${id}`);
    setOpen(false);
    setQuery("");
  };

  const goToShop = (searchQuery?: string) => {
    router.push(`/shop${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-4 w-[90vw] max-w-md bg-background border border-border shadow-2xl z-[100]"
          >
            {/* Input Container */}
            <div className="flex items-center border-b border-border px-4 bg-secondary/10">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) goToShop(query.trim());
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Search products, categories..."
                className="flex-1 bg-transparent py-4 px-3 font-body text-sm focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-1 hover:bg-secondary rounded-full transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="p-2">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Popular Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1.5 text-xs font-body border border-border hover:border-foreground hover:bg-secondary/50 transition-all capitalize"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="mt-2 border-t border-border pt-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground px-3 mb-2">
                    Found {results.length} Products
                  </p>
                  <div className="space-y-1">
                    {results.map((product: any) => (
                      <button
                        key={product._id}
                        onClick={() => goToProduct(product._id)}
                        className="flex items-center gap-4 w-full px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left group"
                      >
                        <div className="w-12 h-16 relative bg-secondary overflow-hidden">
                          <Image 
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm font-medium truncate">{product.name}</p>
                          <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                            {product.subcategory} · ${product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {query.trim() && (
                    <button
                      onClick={() => goToShop(query.trim())}
                      className="w-full mt-2 py-3 text-[10px] tracking-[0.2em] uppercase font-body font-bold text-muted-foreground hover:text-foreground border-t border-border transition-colors text-center"
                    >
                      View all results
                    </button>
                  )}
                </div>
              )}

              {/* Empty/No Results */}
              {query.length >= 2 && results.length === 0 && suggestions.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm font-body text-muted-foreground">
                    No results for <span className="text-foreground font-medium">"{query}"</span>
                  </p>
                </div>
              )}

              {query.length < 2 && (
                <div className="p-3">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground mb-4">
                    Quick Search
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Dresses", "Jackets", "Minimalist", "New Arrivals"].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                           if (term === "New Arrivals") goToShop();
                           else setQuery(term);
                        }}
                        className="p-3 text-xs font-body border border-border hover:bg-secondary/50 transition-all text-left"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
