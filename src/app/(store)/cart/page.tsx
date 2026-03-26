'use client';
import Image from 'next/image';
import { useCart } from "@/contexts/CartContext";
import Link from 'next/link';
import { Minus, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import InlineOtpSignIn from "@/components/InlineOtpSignIn";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { data: session } = useSession();

  const getPId = (product: any) => product._id || product.id;

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-4xl mb-4">Your Bag is Empty</h1>
        <p className="text-muted-foreground font-body mb-8">It looks like you haven't added anything to your bag yet.</p>
        <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-body font-bold hover:bg-primary/90 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <h1 className="font-display text-3xl">Shopping Bag</h1>
        <p className="text-[10px] tracking-widest uppercase font-body text-muted-foreground">{items.length} Items</p>
      </div>

      <div className="flex flex-col gap-8">
        {items.map((item) => {
          const productId = getPId(item.product);
          return (
            <div key={`${productId}-${item.size}-${item.color}`} className="flex gap-3 sm:gap-6 border-b border-border pb-6 sm:pb-8">
              <div className="w-20 h-28 sm:w-32 sm:h-44 flex-shrink-0 relative bg-secondary">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-body text-sm font-medium">{item.product.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mt-2">{item.size} / {item.color}</p>
                  </div>
                  <button onClick={() => removeFromCart(productId, item.size, item.color)} className="p-1 hover:text-destructive transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button className="p-2 hover:bg-secondary transition-colors" onClick={() => updateQuantity(productId, item.size, item.color, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-body">{item.quantity}</span>
                    <button className="p-2 hover:bg-secondary transition-colors" onClick={() => updateQuantity(productId, item.size, item.color, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-body text-sm font-bold">₹{item.product.price * item.quantity}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-secondary/20 p-5 sm:p-8">
        <div className="flex justify-between mb-4">
          <span className="text-xs uppercase tracking-widest font-body text-muted-foreground">Order Subtotal</span>
          <span className="font-body font-bold">₹{cartTotal}</span>
        </div>
        <div className="flex justify-between mb-6">
          <span className="text-xs uppercase tracking-widest font-body text-muted-foreground">Shipping</span>
          <span className="text-xs font-body font-medium uppercase text-green-600">Calculated at checkout</span>
        </div>
        <hr className="border-border mb-8" />
        <Link href="/checkout"
          className="block w-full bg-primary text-primary-foreground text-center py-5 text-xs tracking-[0.2em] uppercase font-body font-bold hover:bg-primary/90 transition-all shadow-xl"
        >
          Proceed to Checkout
        </Link>
      </div>

      {/* Sign-in nudge for guests */}
      {!session && <InlineOtpSignIn />}
    </div>
  );
};

export default CartPage;
