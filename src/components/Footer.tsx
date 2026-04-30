'use client';
import Link from 'next/link';
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePathname } from 'next/navigation';

const Footer = () => {
  const [email, setEmail] = useState("");
  const pathname = usePathname();

  // Don't show store footer on admin routes
  if (pathname.startsWith("/dashboard")) return null;

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-16 text-center">
          <h3 className="font-display text-2xl md:text-3xl mb-3">Stay in the Loop</h3>
          <p className="text-primary-foreground/60 text-sm mb-6 font-body">
            Subscribe for exclusive access to new collections and special offers.
          </p>
          <form onSubmit={handleNewsletter} className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent border border-primary-foreground/20 px-4 py-3 text-sm font-body placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/50"
              required
            />
            <button
              type="submit"
              className="bg-primary-foreground text-primary px-6 py-3 text-xs tracking-[0.15em] uppercase font-body font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase mb-4 font-body font-medium">Shop</h4>
          <div className="flex flex-col gap-2">
            <Link href="/category/women" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">Women</Link>
            <Link href="/category/men" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">Men</Link>
            <Link href="/category/kids" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">Kids</Link>
            <Link href="/shop" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">New Arrivals</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase mb-4 font-body font-medium">Company</h4>
          <div className="flex flex-col gap-2">
            <Link href="/about" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">About Us</Link>
            <Link href="/lookbook" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">Lookbook</Link>
            <Link href="/blog" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">Blog</Link>
            <Link href="/contact" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase mb-4 font-body font-medium">Help</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-foreground/60 font-body">Shipping & Returns</span>
            <span className="text-sm text-primary-foreground/60 font-body">Size Guide</span>
            <span className="text-sm text-primary-foreground/60 font-body">FAQ</span>
            <span className="text-sm text-primary-foreground/60 font-body">Privacy Policy</span>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase mb-4 font-body font-medium">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Facebook" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="container py-6 border-t border-primary-foreground/10 text-center">
        <p className="text-xs text-primary-foreground/40 font-body">
          © {new Date().getFullYear()} ELEVATE. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
