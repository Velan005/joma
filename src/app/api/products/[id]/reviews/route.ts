import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/products/[id]/reviews
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ productId: params.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/products/[id]/reviews
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    const { name, rating, comment } = await req.json();

    // Validate fields
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 60) {
      return NextResponse.json({ error: "Name is required (max 60 chars)" }, { status: 400 });
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }
    if (!comment || typeof comment !== "string" || comment.trim().length < 10 || comment.length > 500) {
      return NextResponse.json({ error: "Comment must be 10–500 characters" }, { status: 400 });
    }

    // Check for duplicate review within 24h (logged-in users only)
    if (userId) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const duplicate = await Review.findOne({
        productId: params.id,
        userId,
        createdAt: { $gt: since },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "You already reviewed this product in the last 24 hours" },
          { status: 429 }
        );
      }
    }

    // Check verified purchase
    let verified = false;
    if (userId) {
      const Order = (await import("@/models/Order")).default;
      const hasOrder = await Order.findOne({
        $or: [{ user: userId }, { "customer.email": session?.user?.email }],
        "products.productId": params.id,
        status: "delivered",
      });
      verified = !!hasOrder;
    }

    const review = await Review.create({
      productId: params.id,
      userId: userId ?? undefined,
      name: name.trim(),
      rating,
      comment: comment.trim(),
      verified,
    });

    // Recalculate product rating + review count
    const agg = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (agg.length > 0) {
      await Product.findByIdAndUpdate(params.id, {
        rating: Math.round(agg[0].avg * 10) / 10,
        reviews: agg[0].count,
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
