import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/orders/[id] - Update order (Admin Only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const data = await req.json();

    // Whitelist only the fields admins are allowed to change
    const allowed = ["status", "paymentStatus", "paymentId", "orderId"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in data) update[key] = data[key];
    }

    const order = await Order.findByIdAndUpdate(params.id, update, { new: true });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Partial update (e.g. status change)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const data = await req.json();

    const order = await Order.findByIdAndUpdate(params.id, { $set: data }, { new: true });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
