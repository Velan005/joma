import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Users, Settings, Package, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border sticky top-0 h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="font-display text-xl tracking-tight">
            Chic <span className="text-muted-foreground">Threads</span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
