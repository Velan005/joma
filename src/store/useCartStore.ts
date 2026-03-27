import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartState {
  items: CartItem[];
  wishlist: Product[];
  isCartOpen: boolean;
  
  // Actions
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  setWishlist: (products: Product[]) => void;
  
  // Computed
  getCartCount: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      isCartOpen: false,

      setIsCartOpen: (open) => set({ isCartOpen: open }),

      addToCart: (product, size, color, quantity = 1) => {
        const items = get().items;
        const pId = product._id || product.id;
        const existing = items.find(
          (i) => (i.product._id || i.product.id) === pId && i.size === size && i.color === color
        );

        if (existing) {
          set({
            items: items.map((i) =>
              (i.product._id || i.product.id) === pId && i.size === size && i.color === color
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
            isCartOpen: true,
          });
        } else {
          set({
            items: [...items, { product, quantity, size, color }],
            isCartOpen: true,
          });
        }
      },

      removeFromCart: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) => !((i.product._id || i.product.id) === productId && i.size === size && i.color === color)
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color);
          return;
        }

        set({
          items: get().items.map((i) =>
            (i.product._id || i.product.id) === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleWishlist: (product) => {
        const wishlist = get().wishlist;
        const pId = product._id || product.id;
        const exists = wishlist.some(p => (p._id || p.id) === pId);
        
        if (exists) {
          set({ wishlist: wishlist.filter(p => (p._id || p.id) !== pId) });
        } else {
          set({ wishlist: [...wishlist, product] });
        }
      },

      isInWishlist: (productId) => get().wishlist.some(p => (p._id || p.id) === productId),

      setWishlist: (products) => set({ wishlist: products }),

      getCartCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getCartTotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: "joma-storage",
      // isCartOpen intentionally excluded — drawer should always start closed on page load
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
      }),
    }
  )
);
