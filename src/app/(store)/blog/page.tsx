'use client';
import Image from 'next/image';
import { motion } from "framer-motion";
import product2 from "@/assets/product-2.jpg";
import product7 from "@/assets/product-7.jpg";
import hero2 from "@/assets/hero-2.jpg";

const posts = [
  {
    id: 1,
    title: "The Art of Capsule Wardrobes",
    excerpt: "Learn how to build a versatile wardrobe with just 30 pieces that work for every occasion.",
    image: product7,
    date: "March 5, 2026",
    category: "Style Guide",
  },
  {
    id: 2,
    title: "Spring Trends to Watch",
    excerpt: "From relaxed tailoring to earthy palettes, discover the trends defining this season.",
    image: hero2,
    date: "February 28, 2026",
    category: "Trends",
  },
  {
    id: 3,
    title: "Sustainable Fashion: A Guide",
    excerpt: "How to make conscious choices without compromising on style or quality.",
    image: product2,
    date: "February 15, 2026",
    category: "Sustainability",
  },
];

const Blog = () => (
  <div className="container py-12">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
      <h1 className="font-display text-4xl md:text-5xl mb-3">Fashion Journal</h1>
      <p className="text-muted-foreground font-body text-sm">Inspiration, tips, and style stories</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {posts.map((post, i) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group cursor-pointer"
        >
          <div className="aspect-[4/5] overflow-hidden mb-4">
            <Image 
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            layout="responsive" width={500} height={500} />
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
            {post.category} · {post.date}
          </span>
          <h2 className="font-display text-xl mt-2 mb-2 group-hover:underline">{post.title}</h2>
          <p className="font-body text-sm text-muted-foreground">{post.excerpt}</p>
        </motion.article>
      ))}
    </div>
  </div>
);

export default Blog;
