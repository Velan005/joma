'use client';
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import Link from 'next/link';

const WishlistPage = () => {
  const { wishlist } = useCart();

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Wishlist</h1>
          <p className="text-sm font-body text-muted-foreground mt-2">Saved items for later.</p>
        </div>
        <p className="text-[10px] tracking-widest uppercase font-body text-muted-foreground">{wishlist.length} Items</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border">
          <p className="text-muted-foreground font-body text-sm mb-6">Your wishlist is currently empty.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {wishlist.map((product: any) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
