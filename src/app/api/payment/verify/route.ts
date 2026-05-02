import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import { logPerf } from "@/lib/logger";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json();

    // Log incoming fields so Vercel logs show exactly what arrived
    console.log("[verify] incoming fields:", {
      razorpay_order_id,
      razorpay_payment_id,
      has_signature: !!razorpay_signature,
      order_id,
    });

    // Validate required fields — prevents silent "undefined|undefined" HMAC body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      console.error("[verify] missing required fields:", { razorpay_order_id, razorpay_payment_id, order_id });
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // Guard against missing env var — avoids wrong HMAC or TypeError in crypto
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("[verify] RAZORPAY_KEY_SECRET is not set in environment");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    console.log("[verify] signature check:", isAuthentic ? "PASS" : "FAIL");

    if (isAuthentic) {
      await connectToDatabase();

      // Atomic update: only succeeds if order exists AND is still unpaid.
      // Prevents double stock deduction if verify is called twice simultaneously.
      const t0 = Date.now();
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
      logPerf("verify:order-update", t0);

      if (!order) {
        // Either order not found or already paid — safe to return success
        return NextResponse.json({ message: "Payment already processed" }, { status: 200 });
      }

      // Deduct stock — support both new (products) and old (items) schemas
      const orderItems: any[] = order.products?.length ? order.products : order.items || [];

      // Single bulkWrite instead of sequential loop — one DB round-trip regardless of cart size
      const bulkOps = orderItems.map((item: any) => ({
        updateOne: {
          filter: { _id: item.productId || item.product },
          update: { $inc: { stock: -item.quantity } },
        },
      }));

      if (bulkOps.length > 0) {
        const t1 = Date.now();
        await Product.bulkWrite(bulkOps, { ordered: false }); // ordered:false — don't stop on one failure
        logPerf("verify:stock-bulkwrite", t1);
      }

      // Fire-and-forget emails — do not await, never block the payment response
      Promise.all([
        sendAdminOrderNotification(order).catch((e: any) => console.error("[email] admin notification failed:", e?.message)),
        sendCustomerOrderConfirmation(order).catch((e: any) => console.error("[email] customer confirmation failed:", e?.message)),
      ]);

      return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
    } else {
      console.error("[verify] signature mismatch — check RAZORPAY_KEY_SECRET in Vercel env vars");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[verify] unhandled error:", error?.message, error?.stack);
    return NextResponse.json({ error: error.message || "Internal server error during verification" }, { status: 500 });
  }
}
