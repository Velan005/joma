"use client";
import React from "react";
import { useCartStore } from "@/store/useCartStore";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useCart = () => {
  const store = useCartStore();
  
  return {
    ...store,
    cartCount: store.getCartCount(),
    cartTotal: store.getCartTotal(),
  };
};
