import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow guest orders

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const dbOrder = await Order.findById(orderId);
    
    if (!dbOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only check authorization if the order HAS a user assigned
    if (dbOrder.user && (!session || dbOrder.user.toString() !== (session.user as any).id)) {
       return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    const options = {
      amount: Math.round(dbOrder.totalAmount * 100), // Razorpay amount in paise
      currency: "INR",
      receipt: `receipt_${dbOrder._id}`,
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 });
  }
}
