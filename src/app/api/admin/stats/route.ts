import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const [totalOrders, totalUsers, totalProducts, allOrders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.find({ paymentStatus: "paid" })
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get sales for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.find({
       createdAt: { $gte: sevenDaysAgo },
       paymentStatus: "paid"
    });

    const dailySales: Record<string, number> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       dailySales[days[d.getDay()]] = 0;
    }

    recentOrders.forEach(order => {
       const day = days[new Date(order.createdAt).getDay()];
       if (dailySales[day] !== undefined) {
          dailySales[day] += order.totalAmount;
       }
    });

    const chartData = Object.entries(dailySales).map(([name, sales]) => ({ name, sales })).reverse();

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      chartData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
