import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await connectToDatabase();

      // Atomic update: only succeeds if order exists AND is still unpaid.
      // Prevents double stock deduction if verify is called twice simultaneously.
      const order = await Order.findOneAndUpdate(
        { _id: order_id, paymentStatus: { $ne: "paid" } },
        {
          $set: {
            paymentStatus: "paid",
            status: "processing",
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          },
        },
        { new: false } // return original doc so we can read the items
      );

      if (!order) {
        // Either order not found or already paid — safe to return success
        return NextResponse.json({ message: "Payment already processed" }, { status: 200 });
      }

      // Deduct stock — support both new (products) and old (items) schemas
      const orderItems: any[] = order.products?.length ? order.products : order.items || [];
      for (const item of orderItems) {
        try {
          const pid = item.productId || item.product;
          await Product.findByIdAndUpdate(pid, {
            $inc: { stock: -item.quantity },
          });
        } catch (stockError) {
          console.error(`Failed to update stock for item ${item.productId || item.product}:`, stockError);
        }
      }

      return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in payment verification:", error);
    return NextResponse.json({ error: error.message || "Internal server error during verification" }, { status: 500 });
  }
}
