'use client';
import Image from 'next/image';
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: session?.user?.email || "", 
    address: "", 
    city: "", 
    zip: "", 
    country: "" 
  });

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to place an order");
      router.push("/account");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order in our DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            product: (i.product as any)._id || i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.product.image
          })),
          shippingAddress: form,
          totalAmount: cartTotal,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // 2. Create Razorpay Order
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      });

      const razorpayOrder = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(razorpayOrder.error);

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Public Key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Chic Threads Emporium",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          // 4. Verify Payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              order_id: orderData._id,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Payment successful!");
            clearCart();
            router.push("/account");
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast.error(error.message);
    } finally {
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
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <h2 className="text-xs tracking-[0.15em] uppercase font-body font-medium">Shipping Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
              className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            <input required placeholder="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
              className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
          </div>
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)}
            className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
          <input required placeholder="Address" value={form.address} onChange={(e) => update("address", e.target.value)}
            className="w-full border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
          <div className="grid grid-cols-3 gap-4">
            <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)}
              className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            <input required placeholder="ZIP" value={form.zip} onChange={(e) => update("zip", e.target.value)}
              className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
            <input required placeholder="Country" value={form.country} onChange={(e) => update("country", e.target.value)}
              className="border border-border px-4 py-3 text-sm font-body bg-transparent focus:outline-none focus:border-foreground" />
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Pay Securely — ${cartTotal}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 font-body">Secure payment processing powered by Razorpay</p>
          </div>
        </form>

        <div className="lg:col-span-2 bg-secondary/50 p-6 h-fit">
          <h2 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-6">Order Summary</h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-auto pr-2">
            {items.map((item) => (
              <div key={`${(item.product as any)._id || item.product.id}-${item.size}`} className="flex gap-4">
                <div className="w-16 h-20 relative bg-secondary">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">{item.size} · {item.color} · Qty {item.quantity}</p>
                  <p className="font-body text-xs mt-1 font-medium">${item.product.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <hr className="border-border my-6" />
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-body">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${cartTotal}</span>
            </div>
            <div className="flex justify-between text-xs font-body">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between pt-4 font-body">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold font-display">${cartTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
