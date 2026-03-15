'use client';
import Image from 'next/image';
import Link from 'next/link';;
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryKids from "@/assets/category-kids.jpg";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const Index = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] overflow-hidden">
        <Image 
          src={hero1}
          alt="Spring Summer 2026 Collection"
          className="w-full h-full object-cover"
        layout="responsive" width={500} height={500} />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute inset-0 flex items-end pb-16 md:pb-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-background mb-4 max-w-2xl">
                Spring Summer 2026
              </h1>
              <p className="text-background/80 font-body text-sm md:text-base mb-8 max-w-md">
                Discover the new collection — where timeless elegance meets modern minimalism.
              </p>
              <Link href="/shop"
                className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-background/90 transition-colors"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl text-center mb-12"
        >
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Women", image: categoryWomen, href: "/category/women" },
            { label: "Men", image: categoryMen, href: "/category/men" },
            { label: "Kids", image: categoryKids, href: "/category/kids" },
          ].map((cat) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link href={cat.href}
                className="group relative block aspect-[3/4] overflow-hidden"
              >
                <Image 
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                layout="responsive" width={500} height={500} />
                <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors" />
                <div className="absolute bottom-6 left-6">
                  <span className="bg-background text-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase font-body font-medium">
                    {cat.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary">
        <div className="container py-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-3xl md:text-4xl">New Arrivals</h2>
            <Link href="/shop"
              className="text-xs tracking-[0.15em] uppercase font-body font-medium underline underline-offset-4"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image 
          src={hero2}
          alt="Menswear collection"
          className="w-full h-full object-cover"
        layout="responsive" width={500} height={500} />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-background mb-6">
              Effortless Style
            </h2>
            <Link href="/category/men"
              className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase font-body font-medium"
            >
              Explore Men's
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Instagram gallery teaser */}
      <section className="container py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl mb-3">@JOMA</h2>
        <p className="text-muted-foreground font-body text-sm mb-8">
          Follow us for daily inspiration
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="aspect-square overflow-hidden">
              <Image 
                src={p.image}
                alt="Instagram"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              layout="responsive" width={500} height={500} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Index;
