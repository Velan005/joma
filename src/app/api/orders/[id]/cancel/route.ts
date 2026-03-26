import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

// POST /api/orders/[id]/cancel
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership (match by userId or email)
    const userId = (session.user as any).id;
    const userEmail = session.user?.email;
    const ownsOrder =
      (order.user && order.user.toString() === userId) ||
      (order.customer?.email && order.customer.email === userEmail);

    if (!ownsOrder) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot cancel if already in a terminal state
    if (["cancelled", "delivered", "shipped"].includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled — current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Check 2-hour cancellation window
    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    if (elapsed > CANCEL_WINDOW_MS) {
      return NextResponse.json(
        { error: "Cancellation window has closed (2 hours after order placement)" },
        { status: 403 }
      );
    }

    order.status = "cancelled";
    await order.save();

    return NextResponse.json({ message: "Order cancelled successfully", order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
