'use client';
import Image from 'next/image';
import { useCart } from "@/contexts/CartContext";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  const getPId = (product: any) => product._id || product.id;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-[100]"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-lg tracking-[0.1em] uppercase">Shopping Bag</h2>
              <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-body text-sm">Your bag is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-[10px] tracking-[0.2em] uppercase underline font-body font-bold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => {
                    const productId = getPId(item.product);
                    return (
                      <div key={`${productId}-${item.size}-${item.color}`} className="flex gap-4">
                        <div className="w-24 h-32 relative bg-secondary">
                          <Image 
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between gap-2">
                              <h3 className="font-body text-sm font-medium leading-tight">{item.product.name}</h3>
                              <button
                                onClick={() => removeFromCart(productId, item.size, item.color)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mt-2">
                              {item.size} / {item.color}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-border">
                              <button
                                onClick={() => updateQuantity(productId, item.size, item.color, item.quantity - 1)}
                                className="p-2 hover:bg-secondary transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-body">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(productId, item.size, item.color, item.quantity + 1)}
                                className="p-2 hover:bg-secondary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-body font-medium">
                              ${item.product.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-secondary/10">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">Subtotal</span>
                  <span className="text-sm font-body font-bold">${cartTotal}</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-body mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full bg-primary text-primary-foreground text-center py-4 text-xs tracking-[0.2em] uppercase font-body font-bold hover:bg-primary/90 transition-all shadow-lg"
                >
                  Checkout
                </Link>
                <Link href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block text-center mt-4 text-[10px] tracking-[0.2em] uppercase underline font-body font-bold text-muted-foreground hover:text-foreground"
                >
                  View Full Bag
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
