"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Heart, Star, Minus, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

export default function ProductDetailContent({ 
  product, 
  relatedProducts 
}: { 
  product: any; 
  relatedProducts: any[] 
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const productId = product._id || product.id;

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (!selectedColor && product.colors?.length > 1) { toast.error("Please select a color"); return; }
    addToCart(product, selectedSize, selectedColor || (product.colors?.[0]?.name || product.colors?.[0] || ""), quantity);
    toast.success("Added to bag");
  };

  return (
    <div className="container py-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="aspect-[3/4] overflow-hidden"
        >
          <Image src={product.image} alt={product.name} className="w-full h-full object-cover" width={1000} height={1333} priority />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-body mb-2">
                {product.subcategory}
              </p>
              <h1 className="font-display text-3xl md:text-4xl mb-2">{product.name}</h1>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className="p-3 border border-border"
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-5 h-5 ${isInWishlist(productId) ? "fill-foreground" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-body text-xl">${product.price}</span>
            {product.originalPrice && (
              <span className="font-body text-lg text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "fill-foreground" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-body text-muted-foreground">
              {product.rating || 0} ({product.reviews || 0} reviews)
            </span>
          </div>

          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 text-justify">
            {product.description}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">
                Color{selectedColor && ` — ${selectedColor}`}
              </h3>
              <div className="flex gap-2">
                {product.colors.map((color: any) => {
                   const colorName = typeof color === 'string' ? color : color.name;
                   const colorHex = typeof color === 'string' ? color.toLowerCase() : color.hex;
                   return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === colorName ? "border-foreground" : "border-border"
                      }`}
                      style={{ backgroundColor: colorHex }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-12 px-3 text-sm font-body border ${
                      selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"
                    } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Quantity</h3>
            <div className="flex items-center border border-border w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-body">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors mb-4"
          >
            Add to Bag — ${product.price * quantity}
          </button>

          <div className="border-t border-border pt-6 mt-auto">
            <details className="group">
              <summary className="text-xs tracking-[0.15em] uppercase font-body font-medium cursor-pointer py-2">
                Shipping & Returns
              </summary>
              <p className="text-sm text-muted-foreground font-body mt-2 leading-relaxed">
                Free standard shipping on orders over $150. Returns accepted within 30 days of purchase. Items must be unworn with tags attached.
              </p>
            </details>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-2xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
