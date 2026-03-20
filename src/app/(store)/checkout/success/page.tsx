import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="container py-32 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
      <h1 className="font-display text-4xl mb-4">Order Confirmed!</h1>
      <p className="text-muted-foreground font-body mb-8">
        Thank you for your purchase. We've received your order and will start processing it right away. You can view your order status in your account.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Link 
          href="/shop" 
          className="flex-1 bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link 
          href="/account" 
          className="flex-1 border border-border py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-secondary transition-colors"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}
