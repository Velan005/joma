import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

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
      await Order.findByIdAndUpdate(order_id, {
        paymentStatus: "paid",
        status: "processing",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });

      return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
