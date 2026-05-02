import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { logPerf } from "@/lib/logger";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const t0 = Date.now();
    await connectToDatabase();
    logPerf("stats:db-connect", t0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const t1 = Date.now();
    const [totalOrders, totalSales, customerEmails, totalProducts, revenueAgg, chartAgg] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      // Unique customers: distinct emails across all orders (captures guests + registered users)
      Order.distinct("customer.email"),
      Product.countDocuments(),
      // Aggregation $sum — no order documents transferred to Node.js memory
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Group by day-of-week inside MongoDB — no JS-side iteration
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dayOfWeek: "$createdAt" }, sales: { $sum: "$totalAmount" } } },
      ]),
    ]);
    logPerf("stats:db-queries", t1);

    const totalCustomers = customerEmails.filter(Boolean).length;
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Map MongoDB $dayOfWeek (1=Sun, 2=Mon ... 7=Sat) to named day buckets
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const salesMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesMap[days[d.getDay()]] = 0;
    }
    chartAgg.forEach((entry: any) => {
      const dayName = days[entry._id - 1]; // $dayOfWeek is 1-indexed starting Sunday
      if (dayName in salesMap) {
        salesMap[dayName] = entry.sales;
      }
    });
    const chartData = Object.entries(salesMap).map(([name, sales]) => ({ name, sales })).reverse();

    return NextResponse.json(
      { totalRevenue, totalOrders, totalSales, totalCustomers, totalProducts, chartData },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
