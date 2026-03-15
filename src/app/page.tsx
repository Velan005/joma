'use client';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) return [];
      const data = await res.json();
      return data.slice(0, 4);
    }
  });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Fashion" 
            fill 
            className="object-cover scale-105 animate-slow-zoom"
            priority
          />
        </div>
        
        <div className="container relative z-20 text-center text-white px-4">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs md:text-sm tracking-[0.4em] uppercase font-body mb-4"
          >
            New Collection 2026
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-8xl lg:text-9xl mb-8 leading-tight"
          >
            ELEVATE YOUR <br /> 
            <span className="italic font-light">Presence.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 text-xs tracking-[0.2em] uppercase font-body font-bold hover:bg-black hover:text-white transition-all duration-300 group"
            >
              Shop Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body mb-2">Editor's Choice</p>
              <h2 className="font-display text-3xl md:text-4xl">Featured Products</h2>
            </div>
            <Link href="/shop" className="text-sm font-body border-b border-foreground pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading ? (
               [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
               ))
            ) : featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
           <Link href="/category/women" className="relative h-[600px] group overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1483985988355-66d7445e233b?q=80&w=2070&auto=format&fit=crop" 
                alt="Women's Collection" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-10 left-10 text-white">
                 <h3 className="font-display text-4xl mb-2">Women</h3>
                 <p className="text-xs tracking-widest uppercase font-body opacity-80 underline underline-offset-4">Explore</p>
              </div>
           </Link>
           <Link href="/category/men" className="relative h-[600px] group overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1488161628813-244aa2f87735?q=80&w=1967&auto=format&fit=crop" 
                alt="Men's Collection" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-10 left-10 text-white">
                 <h3 className="font-display text-4xl mb-2">Men</h3>
                 <p className="text-xs tracking-widest uppercase font-body opacity-80 underline underline-offset-4">Explore</p>
              </div>
           </Link>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-secondary/30">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
           <div className="flex flex-col items-center">
              <Truck className="w-8 h-8 mb-6 stroke-1" />
              <h4 className="font-display text-xl mb-3">Global Shipping</h4>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">Fast and reliable worldwide delivery right to your doorstep.</p>
           </div>
           <div className="flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 mb-6 stroke-1" />
              <h4 className="font-display text-xl mb-3">Secure Payment</h4>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">Full SSL encryption on all transactions ensuring your safety.</p>
           </div>
           <div className="flex flex-col items-center">
              <RefreshCcw className="w-8 h-8 mb-6 stroke-1" />
              <h4 className="font-display text-xl mb-3">Easy Returns</h4>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">30-day no-questions-asked return policy for complete peace of mind.</p>
           </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
         <div className="container max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl mb-6">Join the Emporium</h2>
            <p className="text-primary-foreground/70 font-body mb-10 leading-relaxed">
              Become a member to receive 15% off your first order and exclusive access to limited edition drops.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
               <input 
                type="email" 
                placeholder="Your email address"
                className="flex-1 bg-white/10 border border-white/20 px-6 py-4 text-sm font-body focus:outline-none focus:border-white/50 placeholder:text-white/40"
               />
               <button className="bg-white text-black px-8 py-4 text-xs tracking-[0.2em] uppercase font-body font-bold hover:bg-black hover:text-white transition-colors">
                 Join Now
               </button>
            </form>
         </div>
      </section>
    </div>
  );
}
