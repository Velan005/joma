"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCart } from "@/contexts/CartContext";
import { Heart, Star, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import { toast } from "sonner";

export default function ProductDetailContent({
  product,
  relatedProducts,
}: {
  product: any;
  relatedProducts: any[];
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const productId = product._id || product.id;

  // Auto-select default color on mount
  const defaultVariant = product.variants?.find((v: any) => v.isDefault) ?? product.variants?.[0];
  const [selectedColor, setSelectedColor] = useState<string>(
    defaultVariant?.color ?? product.colors?.[0] ?? ""
  );

  // Build image list: selected variant's front images + back image (if any)
  const getImages = (): string[] => {
    const variant =
      product.variants?.find((v: any) => v.color === selectedColor) ??
      product.variants?.find((v: any) => v.isDefault) ??
      product.variants?.[0];

    if (variant) {
      const front: string[] = variant.images ?? [];
      const back: string[] = variant.backImage ? [variant.backImage] : [];
      const combined = [...front, ...back].filter(Boolean);
      if (combined.length > 0) return combined;
    }
    if (product.images?.length > 0) return product.images;
    return [product.image];
  };

  const images = getImages();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Reset carousel to first image when color changes
  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(0);
    setActiveIndex(0);
  }, [selectedColor, emblaApi]);

  // Re-init carousel when image list changes (variant switch)
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [images.length, emblaApi]);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (!selectedColor && product.colors?.length > 1) { toast.error("Please select a color"); return; }
    addToCart(
      product,
      selectedSize,
      selectedColor || (product.colors?.[0]?.name || product.colors?.[0] || ""),
      quantity
    );
    toast.success("Added to bag");
  };

  return (
    <div className="container py-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="relative overflow-hidden aspect-[3/4] max-h-[60vh] sm:max-h-none" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((src: string, i: number) => (
                <div key={i} className="relative flex-[0_0_100%] h-full">
                  <Image
                    src={src}
                    alt={`${product.name} image ${i + 1}`}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/80 hover:bg-background border border-border transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/80 hover:bg-background border border-border transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`relative flex-shrink-0 w-16 h-20 border-2 transition-colors ${
                    activeIndex === i ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product info */}
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
            <span className="font-body text-xl">₹{product.price}</span>
            {product.originalPrice && (
              <span className="font-body text-lg text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 0) ? "fill-foreground" : "text-muted"
                  }`}
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

          {/* Color selection — prefer variants, fallback to legacy colors[] */}
          {product.variants && product.variants.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">
                Color{selectedColor && ` — ${selectedColor}`}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.color}
                    onClick={() => setSelectedColor(v.color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === v.color ? "border-foreground" : "border-border"
                    }`}
                    style={{ backgroundColor: v.colorHex || "#000" }}
                    title={v.color}
                  />
                ))}
              </div>
            </div>
          ) : product.colors && product.colors.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">
                Color{selectedColor && ` — ${selectedColor}`}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: any) => {
                  const colorName = typeof color === "string" ? color : color.name;
                  const colorHex = typeof color === "string" ? "#000000" : color.hex;
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
          ) : null}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-12 px-3 text-sm font-body border ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-foreground"
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
            Add to Bag — ₹{product.price * quantity}
          </button>

          <div className="border-t border-border pt-6 mt-auto">
            <details className="group">
              <summary className="text-xs tracking-[0.15em] uppercase font-body font-medium cursor-pointer py-2">
                Shipping & Returns
              </summary>
              <p className="text-sm text-muted-foreground font-body mt-2 leading-relaxed">
                Free standard shipping on orders over ₹1500. Returns accepted within 30 days of
                purchase. Items must be unworn with tags attached.
              </p>
            </details>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <ReviewSection productId={productId} />

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
