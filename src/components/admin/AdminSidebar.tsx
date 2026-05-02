"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  Home,
  Menu,
  X,
} from "lucide-react";

const sidebarLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 z-50 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform duration-200",
          "md:translate-x-0 md:static md:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <Link href="/" className="font-display text-xl tracking-tight">
              Joma
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {sidebarLinks.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors",
                  active
                    ? "text-foreground bg-secondary/70"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                ].join(" ")}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            Back to Store
          </Link>
        </div>
      </aside>
    </>
  );
}
