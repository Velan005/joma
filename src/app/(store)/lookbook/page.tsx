'use client';
import Image from 'next/image';
import { motion } from "framer-motion";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";

const images = [hero1, product1, product5, hero2, product2, product6, product7];

const Lookbook = () => (
  <div>
    <div className="container py-12 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Lookbook</h1>
        <p className="text-muted-foreground font-body text-sm">Spring Summer 2026 Collection</p>
      </motion.div>
    </div>

    <div className="container pb-20">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="break-inside-avoid overflow-hidden"
          >
            <Image 
              src={img}
              alt={`Lookbook ${i + 1}`}
              className="w-full object-cover hover:scale-[1.02] transition-transform duration-700"
              loading="lazy"
            layout="responsive" width={500} height={500} />
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Lookbook;
