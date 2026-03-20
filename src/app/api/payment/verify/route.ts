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
      const order = await Order.findById(order_id);

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.paymentStatus === "paid") {
        return NextResponse.json({ message: "Order already paid" }, { status: 200 });
      }

      // Update order payment status
      const updateResult = await Order.findByIdAndUpdate(order_id, {
        paymentStatus: "paid",
        status: "processing",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });

      if (updateResult) {
        // Deduct stock — support both new (products) and old (items) schemas
        const orderItems: any[] = order.products?.length ? order.products : order.items || [];
        for (const item of orderItems) {
          try {
            const pid = item.productId || item.product; // new field or old field
            const product = await Product.findById(pid);
            if (product) {
              product.stock = Math.max(0, product.stock - item.quantity);
              await product.save();
              console.log(`Updated stock for product ${product.name}: new stock ${product.stock}`);
            }
          } catch (stockError) {
            console.error(`Failed to update stock for product ${item.productId || item.product}:`, stockError);
            // Continue even if one item fails, but log it
          }
        }
      }

      return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
    } else {
      console.error("Invalid payment signature for order:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in payment verification:", error);
    return NextResponse.json({ error: error.message || "Internal server error during verification" }, { status: 500 });
  }
}
