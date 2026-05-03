'use client';
import { useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, User, LayoutDashboard, Search } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useCartStore } from "@/store/useCartStore";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "SHOP", href: "/shop" },
  { label: "NEW IN", href: "/shop?filter=new" },
  { label: "MEN", href: "/category/men" },
  { label: "WOMEN", href: "/category/women" },
  { label: "COLLECTIONS", href: "/shop" },
  { label: "ABOUT", href: "/about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getCartCount());
  const wishlistCount = useCartStore((s) => s.wishlist.length);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5] border-b border-[#e8e2db]">
        {/* Announcement bar — cream on mobile, black on desktop */}
        <div className="bg-[#f5f0eb] text-[#1a1a1a] md:bg-black md:text-white text-center py-2 text-[11px] tracking-[0.22em] uppercase font-body">
          DESIGNED TO STAND OUT DAILY →
        </div>

        <nav className="container relative flex items-center h-16">
          {/* Left: hamburger (mobile) | logo + desktop-nav anchor (desktop) */}
          <div className="flex items-center gap-8 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#1a1a1a]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop logo — left aligned */}
            <Link
              href="/"
              className="hidden lg:block font-display text-xl tracking-[0.22em] uppercase font-bold text-[#1a1a1a]"
            >
              JOMA STUDIO
            </Link>
          </div>

          {/* Mobile logo — absolute center */}
          <Link
            href="/"
            className="lg:hidden absolute left-1/2 -translate-x-1/2 font-display text-xl tracking-[0.22em] uppercase font-bold text-[#1a1a1a]"
          >
            JOMA STUDIO 
          </Link>

          {/* Desktop center nav links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`text-[12px] tracking-[0.12em] uppercase font-body font-medium transition-colors hover:text-[#6b6b6b] ${
                  pathname === link.href ? "border-b border-[#1a1a1a] pb-0.5" : "text-[#1a1a1a]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <div className="hidden sm:block mr-1">
              <SearchBar />
            </div>

            {/* Search icon — mobile only */}
            <button className="sm:hidden p-2 text-[#1a1a1a]" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>

            {session ? (
              <>
                {(session?.user as any)?.role === "admin" && (
                  <Link
                    href="/dashboard"
                    className="p-2 hidden sm:block text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/account"
                  className="p-2 hidden sm:block text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <Link
                href="/account"
                className="hidden sm:block text-[11px] tracking-[0.15em] uppercase font-body text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors px-2"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/wishlist"
              className="p-2 hidden sm:flex relative text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#1a1a1a] text-white text-[8px] flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 relative text-[#1a1a1a] hover:text-[#6b6b6b] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#1a1a1a] text-white text-[8px] flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#faf8f5] z-[70] lg:hidden p-8 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end p-2 -mr-2 -mt-2 text-[#1a1a1a]"
              >
                <X className="w-5 h-5" />
              </button>

              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm tracking-[0.15em] uppercase font-display text-[#1a1a1a]"
                  >
                    {link.label}
                  </Link>
                ))}

                <hr className="border-[#e8e2db]" />

                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-sm tracking-[0.1em] uppercase font-body text-[#1a1a1a]"
                >
                  <User className="w-4 h-4" />
                  {session ? "My Account" : "Sign In"}
                </Link>

                {(session?.user as any)?.role === "admin" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-sm tracking-[0.1em] uppercase font-body text-[#1a1a1a]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
              </nav>

              <div className="mt-auto space-y-4">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-body text-[#6b6b6b]"
                >
                  <Heart className="w-4 h-4" />
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block text-xs tracking-[0.2em] uppercase font-body text-[#6b6b6b]"
                >
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
