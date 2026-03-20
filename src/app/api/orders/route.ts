import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders - Get orders (Admin: All, Guest: None)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/orders - Place a new order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow guest orders (no session required)

    await connectToDatabase();
    const data = await req.json();

    // Validate and calculate actual total from database prices
    let calculatedTotal = 0;
    const validatedProducts = [];

    for (const item of data.products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }

      if (data.paymentMethod === "cod") {
        product.stock -= item.quantity;
        await product.save();
      }

      calculatedTotal += product.price * item.quantity;

      validatedProducts.push({
        productId: item.productId,
        name: product.name,
        price: product.price,  // Trust database price, not client
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });
    }

    const orderData: any = {
      customer: data.customer,
      products: validatedProducts,
      totalAmount: calculatedTotal,
      status: "pending",
      paymentStatus: "unpaid",
    };

    // If session exists, link order to user
    if (session) {
      orderData.user = (session.user as any).id;
    }

    const order = await Order.create(orderData);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
