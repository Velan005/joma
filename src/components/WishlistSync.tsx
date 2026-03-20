"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistSync() {
  const { data: session, status } = useSession();
  const { wishlist, setWishlist } = useCartStore();
  const hasFetched = useRef(false);

  // 1. Initial Sync on Login
  useEffect(() => {
    const fetchInitial = async () => {
      if (status === "authenticated" && !hasFetched.current) {
        try {
          const res = await fetch("/api/users/wishlist");
          if (res.ok) {
            const serverWishlist = await res.json();
            
            // Merge local with server
            const serverIds = new Set(serverWishlist.map((p: any) => p._id || p.id));
            const localOnly = wishlist.filter(p => !serverIds.has(p._id || p.id));

            if (localOnly.length > 0) {
               const mergedIds = [...Array.from(serverIds), ...localOnly.map(p => p._id || p.id)];
               const updateRes = await fetch("/api/users/wishlist", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ wishlistIds: mergedIds }),
               });
               if (updateRes.ok) setWishlist(await updateRes.json());
            } else {
               setWishlist(serverWishlist);
            }
            hasFetched.current = true;
          }
        } catch (e) { console.error("Wishlist mount sync err:", e); }
      }
    };
    fetchInitial();
  }, [status, setWishlist]); // Only run on status change

  // 2. Continuous Sync (Local -> Server)
  useEffect(() => {
    const pushUpdate = async () => {
      if (status === "authenticated" && hasFetched.current) {
        try {
           await fetch("/api/users/wishlist", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ wishlistIds: wishlist.map(p => p._id || p.id) }),
           });
        } catch (e) { console.error("Wishlist push sync err:", e); }
      }
    };
    
    // Debounce push
    const timer = setTimeout(pushUpdate, 2000);
    return () => clearTimeout(timer);
  }, [wishlist, status]);

  // Reset flag on logout
  useEffect(() => {
    if (status === "unauthenticated") hasFetched.current = false;
  }, [status]);

  return null;
}
