import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WishlistSync from "./WishlistSync";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[calc(2rem+4rem+8px)]">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WishlistSync />
    </div>
  );
};

export default Layout;
