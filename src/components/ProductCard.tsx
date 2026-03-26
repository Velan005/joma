'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist } = useCart();
  const productId = (product as any)._id || product.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/product/${productId}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] overflow-hidden">
          <Image 
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            layout="responsive" 
            width={500} 
            height={500} 
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-primary text-primary-foreground text-[10px] tracking-[0.15em] uppercase px-2 py-1 font-body">
              New
            </span>
          )}
          {(product as any).isSale && (
            <span className="bg-destructive text-destructive-foreground text-[10px] tracking-[0.15em] uppercase px-2 py-1 font-body">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-4 h-4 ${isInWishlist(productId) ? "fill-foreground" : ""}`}
          />
        </button>
      </Link>

      {/* Info */}
      <div className="mt-2">
        <Link href={`/product/${productId}`}>
          <h3 className="font-body text-xs sm:text-sm font-medium leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="font-body text-xs sm:text-sm">₹{product.price}</span>
          {product.originalPrice && (
            <span className="font-body text-xs sm:text-sm text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
        {/* Color dots */}
        <div className="flex gap-1 mt-1.5">
          {product.colors && product.colors.map((color: any) => (
            <span
              key={typeof color === 'string' ? color : color.name}
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: typeof color === 'string' ? color.toLowerCase() : color.hex }}
              title={typeof color === 'string' ? color : color.name}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
