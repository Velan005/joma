'use client';
import { useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, User, LayoutDashboard } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "New In", href: "/shop" },
  { label: "Women", href: "/category/women" },
  { label: "Men", href: "/category/men" },
  { label: "Kids", href: "/category/kids" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, setIsCartOpen, wishlist } = useCart();
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show store navbar on admin routes
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground text-center py-2 text-[10px] tracking-[0.2em] uppercase font-body">
          Free shipping on orders over ₹1500
        </div>

        <nav className="container flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="font-display text-xl tracking-[0.15em] uppercase font-bold">
            JOMA
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.15em] uppercase font-body font-medium transition-colors hover:text-muted-foreground ${
                  pathname === link.href ? "border-b border-foreground pb-0.5" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block mr-2">
              <SearchBar />
            </div>
            
            {session ? (
              <>
                {(session?.user as any)?.role === "admin" && (
                  <Link href="/dashboard" className="p-2 hidden sm:block text-muted-foreground hover:text-foreground transition-colors" title="Admin Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link href="/account" className="p-2 hidden sm:block text-muted-foreground hover:text-foreground transition-colors" aria-label="Account">
                  <User className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <Link href="/account" className="hidden sm:block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground hover:text-foreground transition-colors px-2">
                Sign In
              </Link>
            )}

            <Link href="/wishlist" className="p-2 relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 relative text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-background z-[70] lg:hidden p-8 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="self-end p-2 -mr-2 -mt-2">
                <X className="w-5 h-5" />
              </button>
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg tracking-[0.1em] uppercase font-display"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <hr className="border-border" />
                
                <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm tracking-[0.1em] uppercase font-body">
                  <User className="w-4 h-4" />
                  {session ? "My Account" : "Sign In"}
                </Link>

                {(session?.user as any)?.role === "admin" && (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm tracking-[0.1em] uppercase font-body text-primary">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
              </nav>

              <div className="mt-auto space-y-4">
                <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-xs tracking-[0.2em] uppercase font-body text-muted-foreground">
                  About Us
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-xs tracking-[0.2em] uppercase font-body text-muted-foreground">
                  Contact
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
