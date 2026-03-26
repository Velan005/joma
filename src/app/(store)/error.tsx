'use client';
import { useEffect } from "react";
import Link from "next/link";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-20 text-center">
      <h1 className="font-display text-3xl mb-4">Something went wrong</h1>
      <p className="text-muted-foreground font-body text-sm mb-8">
        We ran into an unexpected error. Please try again.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-primary-foreground text-xs tracking-[0.15em] uppercase font-body"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-3 border border-border text-xs tracking-[0.15em] uppercase font-body">
          Go home
        </Link>
      </div>
    </div>
  );
}
