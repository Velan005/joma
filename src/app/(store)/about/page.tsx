'use client';
import Image from 'next/image';
import { motion } from "framer-motion";
import hero1 from "@/assets/hero-1.jpg";

const About = () => (
  <div>
    <section className="relative h-[50vh] overflow-hidden">
      <Image src={hero1} alt="About JOMA" className="w-full h-full object-cover" layout="responsive" width={500} height={500} />
      <div className="absolute inset-0 bg-foreground/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="font-display text-4xl md:text-5xl text-background">About Us</h1>
      </div>
    </section>

    <div className="container py-20 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-display text-3xl mb-6">Our Story</h2>
        <p className="font-body text-muted-foreground leading-relaxed mb-6">
          JOMA was born from a belief that exceptional fashion should be accessible. Founded in 2020, we curate timeless pieces that transcend seasons — designed for the modern individual who values quality, sustainability, and understated elegance.
        </p>
        <p className="font-body text-muted-foreground leading-relaxed mb-6">
          Every piece in our collection is thoughtfully crafted using premium materials sourced from ethical suppliers across Europe. We work with artisan manufacturers who share our commitment to quality and fair labor practices.
        </p>
        <h2 className="font-display text-3xl mb-6 mt-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Quality First", text: "Premium materials and expert craftsmanship in every piece." },
            { title: "Sustainable", text: "Ethical sourcing and eco-conscious production practices." },
            { title: "Timeless Design", text: "Pieces that transcend trends and last for years." },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="font-display text-lg mb-2">{v.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default About;
