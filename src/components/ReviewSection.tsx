"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "w-5 h-5",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);
  const display = readonly ? value : (hovered || value);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={readonly ? undefined : "button"}
          onClick={readonly ? undefined : () => onChange?.(n)}
          onMouseEnter={readonly ? undefined : () => setHovered(n)}
          onMouseLeave={readonly ? undefined : () => setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
          aria-label={readonly ? undefined : `Rate ${n}`}
        >
          <Star
            className={`${size} ${n <= display ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) throw new Error("Failed to load reviews");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setName("");
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating"); return; }
    submitMutation.mutate();
  };

  // Summary stats
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="font-display text-2xl mb-8">Reviews</h2>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-10 p-6 bg-secondary/20 border border-border">
          <div className="text-center">
            <p className="font-display text-5xl">{avgRating}</p>
            <StarRating value={avgRating} readonly size="w-4 h-4" />
            <p className="text-xs font-body text-muted-foreground mt-1">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs font-body">
                  <span className="w-4 text-right">{star}</span>
                  <Star className="w-3 h-3 fill-foreground" />
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write a review */}
      <div className="mb-12">
        <h3 className="text-xs tracking-[0.15em] uppercase font-body font-medium mb-6">
          Write a Review
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <label className="text-xs tracking-[0.1em] uppercase font-body">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-[0.1em] uppercase font-body">Name</label>
            <input
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-[0.1em] uppercase font-body">Comment</label>
            <textarea
              required
              minLength={10}
              maxLength={500}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-secondary/30 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-primary resize-none"
              placeholder="Share your thoughts (10–500 characters)"
            />
            <p className="text-xs text-muted-foreground font-body text-right">{comment.length}/500</p>
          </div>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="px-8 py-3 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-2 border-t border-border pt-6">
              <div className="h-3 w-24 bg-secondary rounded" />
              <div className="h-3 w-full bg-secondary rounded" />
              <div className="h-3 w-2/3 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm font-body text-muted-foreground">
          No reviews yet. Be the first to review this product.
        </p>
      ) : (
        <div className="space-y-0">
          {reviews.map((review) => (
            <div key={review._id} className="border-t border-border py-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-body font-medium">{review.name}</p>
                    {review.verified && (
                      <span className="text-[10px] font-body px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                        Verified
                      </span>
                    )}
                  </div>
                  <StarRating value={review.rating} readonly size="w-3.5 h-3.5" />
                </div>
                <time className="text-xs font-body text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
