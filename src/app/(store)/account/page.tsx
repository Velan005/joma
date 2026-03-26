'use client';
import { useState, useEffect } from "react";
import { Package, Heart, Settings, LogOut, Loader2, ArrowLeft, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

function useCancellable(createdAt: string) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor((CANCEL_WINDOW_MS - elapsed) / 1000));
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      setSecondsLeft(Math.max(0, Math.floor((CANCEL_WINDOW_MS - elapsed) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [createdAt, secondsLeft]);

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return { canCancel: secondsLeft > 0, secondsLeft, formatted };
}

type ActiveTab = "overview" | "profile" | "orders";
type AuthStep = "email-phone" | "otp-entry" | "admin-login";

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [authStep, setAuthStep] = useState<AuthStep>("email-phone");

  // Email-phone step state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP step state
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Admin login state
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (status === "loading") {
    return (
      <div className="container py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setAuthStep("otp-entry");
      setResendCooldown(60);
      toast.success("Code sent! Check your email.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      const result = await signIn("credentials", {
        email,
        isOtpLogin: "true",
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      toast.success("Welcome!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password: adminPassword,
      isOtpLogin: "false",
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

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend");
      setResendCooldown(60);
      setOtp("");
      toast.success("New code sent!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // If not logged in, show OTP auth flow
  if (!session) {
    return (
      <div className="container py-20 max-w-md mx-auto">
        <div className="bg-background border border-border p-8">

          {authStep === "email-phone" && (
            <>
              <h2 className="font-display text-2xl mb-2">Sign In</h2>
              <p className="text-xs text-muted-foreground font-body mb-8">
                Enter your email and we&apos;ll send you a login code.
              </p>
              <form onSubmit={handleSendOtp} className="space-y-6">
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
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Login Code"}
                </button>
              </form>
              <div className="mt-8 pt-6 border-t border-border text-center">
                <button
                  onClick={() => setAuthStep("admin-login")}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground font-body hover:text-foreground transition-colors"
                >
                  Admin Login
                </button>
              </div>
            </>
          )}

          {authStep === "otp-entry" && (
            <>
              <button
                onClick={() => { setAuthStep("email-phone"); setOtp(""); }}
                className="inline-flex items-center gap-2 text-xs font-body text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="font-display text-2xl mb-2">Enter Code</h2>
              <p className="text-xs text-muted-foreground font-body mb-8">
                We sent a 6-digit code to <span className="text-foreground">{email}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">6-Digit Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="000000"
                    className="w-full bg-secondary/30 border border-border px-4 py-3 text-2xl font-body tracking-[0.5em] text-center focus:outline-none focus:border-primary"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-[10px] uppercase tracking-widest font-body text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </>
          )}

          {authStep === "admin-login" && (
            <>
              <button
                onClick={() => setAuthStep("email-phone")}
                className="inline-flex items-center gap-2 text-xs font-body text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="font-display text-2xl mb-2">Admin Login</h2>
              <p className="text-xs text-muted-foreground font-body mb-8">Sign in with your admin credentials.</p>
              <form onSubmit={handleAdminLogin} className="space-y-6">
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
                  <label htmlFor="admin-password" className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Password</label>
                  <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
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
            </>
          )}

        </div>
      </div>
    );
  }

  // Logged In Content
  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-3xl">My Account</h1>
        <p className="text-sm font-body text-muted-foreground mt-1">Hello, {session.user?.name}</p>
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
          {user?.phone && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Phone</label>
              <input
                readOnly
                value={user.phone}
                className="w-full bg-secondary/10 border border-border px-4 py-3 text-sm font-body opacity-70"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground font-body border-l-2 border-border pl-4">
            Account management is handled securely via Joma. Contact support to change email or name.
          </p>
       </div>
    </motion.div>
  );
};

function CancelButton({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      return data;
    },
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <button
      onClick={() => cancelMutation.mutate()}
      disabled={cancelMutation.isPending}
      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-body px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
    >
      {cancelMutation.isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      Cancel Order
    </button>
  );
}

function OrderCancelRow({ order }: { order: any }) {
  const { canCancel, formatted } = useCancellable(order.createdAt);
  const cancellable = ["pending", "processing"].includes(order.status);

  if (!cancellable) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {canCancel ? (
        <>
          <span className="text-[10px] font-body text-muted-foreground">
            Cancel window closes in <span className="font-medium text-foreground">{formatted}</span>
          </span>
          <CancelButton orderId={order._id} />
        </>
      ) : (
        <span className="text-[10px] uppercase tracking-widest font-body px-3 py-1 border border-orange-200 bg-orange-50 text-orange-600">
          Printing Started
        </span>
      )}
    </div>
  );
}

const OrderHistory = () => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/orders").then(res => res.json()),
  });

  if (isLoading) return <div className="py-20 text-center text-sm font-body">Loading orders...</div>;

  if (orders.length === 0) return (
    <div className="py-20 text-center border border-dashed border-border">
      <p className="text-sm font-body text-muted-foreground">You haven't placed any orders yet.</p>
      <Link href="/shop" className="text-xs tracking-widest uppercase font-body underline mt-4 inline-block">Start Shopping</Link>
    </div>
  );

  const getProducts = (order: any) => order.products?.length ? order.products : order.items || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {orders.map((order: any) => {
        const isExpanded = expandedOrder === order._id;
        const products = getProducts(order);
        return (
          <div key={order._id} className="border border-border">
            {/* Summary row */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-body font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{products.length} item{products.length !== 1 ? "s" : ""} · ₹{order.totalAmount}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <span className={`text-[10px] uppercase tracking-widest font-body px-3 py-1 border ${
                  order.paymentStatus === "paid" ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"
                }`}>
                  {order.paymentStatus}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-body px-3 py-1 bg-secondary text-secondary-foreground">
                  {order.status}
                </span>
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="p-1.5 border border-border hover:bg-secondary transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Cancel window row */}
            {order.status !== "cancelled" && (
              <div className="px-5 pb-4">
                <OrderCancelRow order={order} />
              </div>
            )}

            {/* Expandable detail */}
            {isExpanded && (
              <div className="border-t border-border bg-secondary/10 px-5 py-4 space-y-4">
                {/* Products */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-2">Items Ordered</p>
                  <div className="space-y-2">
                    {products.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-background border border-border px-4 py-3">
                        <div>
                          <p className="text-sm font-body font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                            {[item.size, item.color].filter(Boolean).join(" · ")} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-body font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery address */}
                {order.customer?.address && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">Delivery Address</p>
                    <p className="text-sm font-body">{order.customer.address.street}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {[order.customer.address.city, order.customer.address.state, order.customer.address.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export default AccountPage;
