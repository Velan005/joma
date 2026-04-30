'use client';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const inView = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) return [];
      const data = await res.json();
      return data.slice(0, 4);
    },
  });

  return (
    <div className="flex flex-col w-full bg-[#faf8f5]">

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative h-[58vh] md:h-[78vh] overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="New Collection 2026 — clothing rack with warm natural lighting"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Left-side cream gradient so dark text is readable over the light image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5]/60 via-[#faf8f5]/20 to-transparent pointer-events-none" />
        {/* Subtle bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Hero content — left-aligned, limited to ~45% width */}
        <div className="absolute inset-0 flex items-center">
          <div className="container max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
            <div className="max-w-[420px] md:max-w-[500px]">

              {/* Collection label */}
              <motion.p
                {...fadeUp(0)}
                className="text-[11px] uppercase tracking-[0.35em] text-[#1a1a1a] font-body mb-3"
              >
                New Collection 2026
              </motion.p>

              {/* Horizontal rule */}
              <motion.hr
                {...fadeUp(0.1)}
                className="w-8 border-t-2 border-[#1a1a1a]/40 mb-5"
              />

              {/* Main heading — mixed serif/sans */}
              <motion.h1
                {...fadeUp(0.18)}
                className="leading-[1.12] mb-5 text-[#1a1a1a]"
              >
                <span className="font-body font-bold text-[38px] md:text-[52px] lg:text-[56px] block">
                  Elevate
                </span>
                <span className="font-body font-bold text-[38px] md:text-[52px] lg:text-[56px] block">
                  Your
                </span>
                <span className="font-display italic font-medium text-[38px] md:text-[52px] lg:text-[56px] block">
                  Presence.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                {...fadeUp(0.3)}
                className="text-[13px] md:text-[14px] text-[#6b6b6b] font-body mb-7 leading-relaxed"
              >
                Timeless designs. Premium quality.
                <br />
                Crafted for the modern you.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                {...fadeUp(0.42)}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start"
              >
                <Link
                  href="/shop"
                  className="bg-black text-white px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] font-body text-center hover:bg-white hover:text-black transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  SHOP COLLECTION <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
                <Link
                  href="/shop?filter=new"
                  className="border border-[#1a1a1a] bg-transparent text-[#1a1a1a] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] font-body text-center hover:bg-[#1a1a1a] hover:text-white transition-colors duration-200"
                >
                  EXPLORE NEW IN
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="w-5 h-[5px] bg-[#1a1a1a] rounded-full" />
          <span className="w-[5px] h-[5px] border border-[#1a1a1a]/40 rounded-full" />
          <span className="w-[5px] h-[5px] border border-[#1a1a1a]/40 rounded-full" />
        </div>
      </section>

      {/* ──────────────── FEATURED PRODUCTS ──────────────── */}
      <section className="py-10 md:py-16 bg-[#faf8f5]">
        <div className="container max-w-7xl mx-auto px-4">

          {/* Section header */}
          <div className="flex items-end justify-between mb-8 md:mb-10">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#6b6b6b] font-body mb-2">
                Editor&apos;s Choice
              </p>
              <h2 className="font-display text-[26px] md:text-[30px] text-[#1a1a1a]">
                Featured Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-[11px] tracking-[0.18em] uppercase font-body text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-[#6b6b6b] hover:border-[#6b6b6b] transition-colors whitespace-nowrap"
            >
              VIEW ALL →
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-[#f0ebe4] animate-pulse"
                  />
                ))
              : featuredProducts.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* ──────────────── WOMEN CATEGORY BANNER ──────────────── */}
      <motion.section
        {...inView}
        className="relative h-[380px] md:h-[500px] overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
          alt="Women's Collection — timeless pieces"
          fill
          className="object-cover object-top"
        />
        {/* Left dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
            <div className="max-w-xs md:max-w-sm text-white">
              <h2 className="font-display italic text-[40px] md:text-[50px] leading-tight mb-3 text-white">
                Women
              </h2>
              <p className="text-[13px] text-white/78 font-body mb-7 leading-relaxed">
                Timeless pieces, designed to empower every moment.
              </p>
              <Link
                href="/category/women"
                className="inline-block border border-white text-white px-8 py-3 text-[11px] uppercase tracking-[0.18em] font-body hover:bg-white hover:text-black transition-colors duration-200"
              >
                EXPLORE WOMEN →
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ──────────────── MEN CATEGORY BANNER ──────────────── */}
      <motion.section
        {...inView}
        className="relative h-[380px] md:h-[500px] overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop"
          alt="Men's Collection — bold essentials for the modern gentleman"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
            <div className="max-w-xs md:max-w-sm text-white">
              <h2 className="font-display italic text-[40px] md:text-[50px] leading-tight mb-3 text-white">
                Men
              </h2>
              <p className="text-[13px] text-white/80 font-body mb-7 leading-relaxed">
                Bold essentials for the modern gentleman.
              </p>
              <Link
                href="/category/men"
                className="inline-block border border-white text-white px-8 py-3 text-[11px] uppercase tracking-[0.18em] font-body hover:bg-white hover:text-black transition-colors duration-200"
              >
                EXPLORE MEN →
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ──────────────── TRUST BADGES ──────────────── */}
      <motion.section
        {...inView}
        className="py-10 md:py-14 bg-white border-t border-[#e8e2db]"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">

            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-6 h-6 text-[#1a1a1a]" strokeWidth={1.4} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-body font-semibold text-[#1a1a1a] mb-1">
                  Free Shipping
                </p>
                <p className="text-[12px] text-[#6b6b6b] font-body">
                  On orders above ₹1999
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <RotateCcw className="w-6 h-6 text-[#1a1a1a]" strokeWidth={1.4} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-body font-semibold text-[#1a1a1a] mb-1">
                  Easy Returns
                </p>
                <p className="text-[12px] text-[#6b6b6b] font-body">
                  14 day return policy
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#1a1a1a]" strokeWidth={1.4} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-body font-semibold text-[#1a1a1a] mb-1">
                  Secure Payment
                </p>
                <p className="text-[12px] text-[#6b6b6b] font-body">
                  100% secure checkout
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <Headphones className="w-6 h-6 text-[#1a1a1a]" strokeWidth={1.4} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-body font-semibold text-[#1a1a1a] mb-1">
                  Customer Support
                </p>
                <p className="text-[12px] text-[#6b6b6b] font-body">
                  We&apos;re here to help
                </p>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

    </div>
  );
}
