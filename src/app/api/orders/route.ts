import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders - Get orders (Admin: All, User: Own)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    let query = {};
    if ((session.user as any).role !== "admin") {
      query = { user: (session.user as any).id };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).populate("user", "name email");
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/orders - Place a new order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const data = await req.json();

    const order = await Order.create({
      ...data,
      user: (session.user as any).id,
      status: "pending",
      paymentStatus: "unpaid", // Will be updated by payment verification
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
