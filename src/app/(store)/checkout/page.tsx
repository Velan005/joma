'use client';
import Image from 'next/image';
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from "next-auth/react";
import { Loader2, ChevronDown } from "lucide-react";

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("checkoutForm");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle migration from old form shape
        if (parsed.firstName !== undefined) {
          setForm({
            name: `${parsed.firstName} ${parsed.lastName}`.trim(),
            email: parsed.email || "",
            phone: "",
            street: parsed.address || "",
            city: parsed.city || "",
            state: parsed.country || "",
            pincode: parsed.zip || "",
          });
        } else {
          setForm(parsed);
        }
      } catch {
        // Ignore corrupted data
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("checkoutForm", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  // OTP section state (optional — for unauthenticated users to link order to account)
  const [otpSectionOpen, setOtpSectionOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [checkoutOtp, setCheckoutOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  const handleCheckoutSendOtp = async () => {
    if (!form.email || !form.phone) {
      toast.error("Please fill in email and phone first");
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, phone: form.phone, name: form.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setOtpStep("sent");
      setOtpCooldown(60);
      toast.success("Code sent to your email!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setOtpSending(false);
    }
  };

  const handleCheckoutVerifyOtp = async () => {
    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: checkoutOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      const result = await signIn("credentials", {
        email: form.email,
        isOtpLogin: "true",
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      setOtpStep("verified");
      toast.success("Account linked! Your order will be saved.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // 1. Create Order in our DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: items.map(i => ({
            productId: (i.product as any)._id || i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: {
              street: form.street,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
            },
          },
          paymentMethod: "razorpay",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // 2. Create Razorpay Order
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData._id }),
      });

      const razorpayOrder = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(razorpayOrder.error);

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Joma",
        description: `Order #${orderData._id.slice(-6).toUpperCase()}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          // 4. Verify Payment
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                order_id: orderData._id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Payment successful!");
              clearCart();
              router.push("/checkout/success");
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            toast.error(verifyError.message);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info("Payment cancelled. You can try again or choose another method.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#000000",
        },
      };

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh the page.");
      }

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "An error occurred during checkout");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl mb-4">Your bag is empty</h1>
        <Link href="/shop" className="text-sm underline font-body">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">

          <div className="space-y-6">
            <h2 className="text-xs tracking-[0.15em] uppercase font-body font-medium">Customer Information</h2>
            <input required placeholder="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)}
              className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)}
                className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            </div>
          </div>

          {/* Optional OTP section — only shown to unauthenticated users */}
          {!session && (
            <div className="border border-border">
              <button
                type="button"
                onClick={() => setOtpSectionOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <span className="text-xs tracking-[0.15em] uppercase font-body font-medium">
                    {otpStep === "verified" ? "Account Linked" : "Save Order to Account"}
                  </span>
                  {otpStep !== "verified" && (
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">Track your order by linking your email</p>
                  )}
                  {otpStep === "verified" && (
                    <p className="text-[10px] text-green-600 font-body mt-0.5">Order will be saved to your account</p>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${otpSectionOpen ? "rotate-180" : ""}`} />
              </button>

              {otpSectionOpen && otpStep !== "verified" && (
                <div className="px-4 pb-4 border-t border-border space-y-4 pt-4">
                  {otpStep === "idle" && (
                    <div className="space-y-3">
                      <p className="text-xs font-body text-muted-foreground">
                        We&apos;ll send a 6-digit code to <span className="text-foreground">{form.email || "your email"}</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleCheckoutSendOtp}
                        disabled={otpSending}
                        className="px-4 py-2 border border-border text-xs font-body tracking-[0.1em] uppercase hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        {otpSending ? "Sending..." : "Send Code"}
                      </button>
                    </div>
                  )}
                  {otpStep === "sent" && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground tracking-[0.3em] text-center"
                        value={checkoutOtp}
                        onChange={(e) => setCheckoutOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCheckoutVerifyOtp}
                          disabled={otpSending || checkoutOtp.length !== 6}
                          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-body tracking-[0.1em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {otpSending ? "Verifying..." : "Verify"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCheckoutSendOtp}
                          disabled={otpCooldown > 0 || otpSending}
                          className="px-4 py-2 border border-border text-xs font-body tracking-[0.1em] uppercase hover:bg-secondary transition-colors disabled:opacity-40"
                        >
                          {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : "Resend"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-xs tracking-[0.15em] uppercase font-body font-medium">Delivery Address</h2>
            <input required placeholder="Street Address" value={form.street} onChange={(e) => update("street", e.target.value)}
              className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)}
                className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
              <input required placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)}
                className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
              <input required placeholder="Pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)}
                className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {`Pay Securely — ₹${cartTotal}`}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 font-body">
              Secure payment processing powered by Razorpay
            </p>
          </div>
        </form>

        <div className="lg:col-span-2 bg-secondary/50 p-6 h-fit">
          <h2 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-6">Order Summary</h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-auto pr-2">
            {items.map((item) => (
              <div key={`${(item.product as any)._id || item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                <div className="w-16 h-20 relative bg-secondary">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">{item.size} · {item.color} · Qty {item.quantity}</p>
                  <p className="font-body text-xs mt-1 font-medium">₹{item.product.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <hr className="border-border my-6" />
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-body">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-xs font-body">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between pt-4 font-body">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold font-display">₹{cartTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
