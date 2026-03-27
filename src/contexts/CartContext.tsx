"use client";
import React from "react";
import { useCartStore } from "@/store/useCartStore";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Each useCartStore(selector) call creates a granular Zustand subscription.
 * The component using useCart() only re-renders when the specific slice it reads changes —
 * NOT on every store update. This replaces the original useCartStore() (no selector)
 * which subscribed to the entire store and caused re-renders on any state change.
 */
export const useCart = () => {
  // Actions — stable function references in Zustand, selecting them never causes re-renders
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const isInWishlist = useCartStore((s) => s.isInWishlist);
  const setWishlist = useCartStore((s) => s.setWishlist);

  // State slices — each subscription only re-renders when its own value changes
  const items = useCartStore((s) => s.items);
  const wishlist = useCartStore((s) => s.wishlist);
  const isCartOpen = useCartStore((s) => s.isCartOpen);

  // Computed numbers — Zustand compares by value (===), so only re-renders on actual change
  const cartCount = useCartStore((s) => s.getCartCount());
  const cartTotal = useCartStore((s) => s.getCartTotal());

  return {
    items,
    wishlist,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    setWishlist,
    cartCount,
    cartTotal,
  };
};
