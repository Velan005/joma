'use client';
import { useState, useEffect } from "react";
import { User, Package, Heart, MapPin, Settings, Plus, Trash2, Edit2, Save, X, LogOut, Loader2 } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ActiveTab = "overview" | "addresses" | "profile" | "orders";

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="container py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Welcome back!");
      router.refresh();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created! Please login.");
        setIsLogin(true);
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show Auth Forms
  if (!session) {
    return (
      <div className="container py-20 max-w-md mx-auto">
        <div className="bg-background border border-border p-8">
          <div className="flex gap-8 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`text-xs tracking-[0.2em] uppercase font-body font-medium pb-2 border-b-2 transition-colors ${isLogin ? "border-primary" : "border-transparent text-muted-foreground"}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`text-xs tracking-[0.2em] uppercase font-body font-medium pb-2 border-b-2 transition-colors ${!isLogin ? "border-primary" : "border-transparent text-muted-foreground"}`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Email</label>
                <input 
                  type="email" 
                  autoComplete="email"
                  required
                  className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Password</label>
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required
                  className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Logged In Content
  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-3xl">My Account</h1>
          <p className="text-sm font-body text-muted-foreground mt-1">Hello, {session.user?.name}</p>
        </div>
        {(session.user as any).role === "admin" && (
           <Link 
            href="/dashboard"
            className="text-xs tracking-[0.15em] uppercase font-body border border-border px-4 py-2 hover:bg-secondary transition-colors"
           >
             Admin Dashboard
           </Link>
        )}
      </div>

      <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto">
        {([
          { key: "overview", label: "Overview" },
          { key: "orders", label: "Orders" },
          { key: "profile", label: "Settings" },
        ] as { key: ActiveTab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-[10px] tracking-[0.15em] uppercase font-body whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button 
          onClick={() => signOut()}
          className="pb-3 text-[10px] tracking-[0.15em] uppercase font-body text-destructive ml-auto flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" /> Logout
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab("orders")} className="p-6 border border-border text-left hover:bg-secondary transition-colors">
                  <Package className="w-5 h-5 mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium font-body">My Orders</h3>
                  <p className="text-xs text-muted-foreground font-body">Track your shipments</p>
                </button>
                <Link href="/wishlist" className="p-6 border border-border text-left hover:bg-secondary transition-colors">
                  <Heart className="w-5 h-5 mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium font-body">Wishlist</h3>
                  <p className="text-xs text-muted-foreground font-body">Your saved items</p>
                </Link>
                <button onClick={() => setActiveTab("profile")} className="p-6 border border-border text-left hover:bg-secondary transition-colors">
                  <Settings className="w-5 h-5 mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium font-body">Profile</h3>
                  <p className="text-xs text-muted-foreground font-body">Manage account settings</p>
                </button>
             </div>
          </motion.div>
        )}

        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "orders" && <OrderHistory />}
      </AnimatePresence>
    </div>
  );
};

const ProfileSettings = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/users/profile").then(res => res.json())
  });

  if (isLoading) return <div className="py-20 text-center text-sm font-body">Loading settings...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
       <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Name</label>
            <input 
              readOnly
              value={user?.name || ""}
              className="w-full bg-secondary/10 border border-border px-4 py-3 text-sm font-body opacity-70"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Email</label>
            <input 
              readOnly
              value={user?.email || ""}
              className="w-full bg-secondary/10 border border-border px-4 py-3 text-sm font-body opacity-70"
            />
          </div>
          <p className="text-xs text-muted-foreground font-body border-l-2 border-border pl-4">
            Account management is handled securely via Joma. Contact support to change email or name.
          </p>
       </div>
    </motion.div>
  );
};

const OrderHistory = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/orders").then(res => res.json())
  });

  if (isLoading) return <div className="py-20 text-center text-sm font-body">Loading orders...</div>;

  if (orders.length === 0) return (
    <div className="py-20 text-center border border-dashed border-border">
      <p className="text-sm font-body text-muted-foreground">You haven't placed any orders yet.</p>
      <Link href="/shop" className="text-xs tracking-widest uppercase font-body underline mt-4 inline-block">Start Shopping</Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
       {orders.map((order: any) => (
         <div key={order._id} className="border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">Order #{order._id.slice(-8)}</p>
              <p className="text-sm font-body font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{order.items.length} items • ${order.totalAmount}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] uppercase tracking-widest font-body px-3 py-1 border ${
                order.paymentStatus === 'paid' ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"
              }`}>
                {order.paymentStatus}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-body px-3 py-1 bg-secondary text-secondary-foreground">
                {order.status}
              </span>
            </div>
         </div>
       ))}
    </motion.div>
  );
};

export default AccountPage;
