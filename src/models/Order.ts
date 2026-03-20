import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },

    // ─── New fields (primary) ─────────────────────────────
    customer: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
    },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        size: { type: String },
        color: { type: String },
      },
    ],

    // ─── Old fields (kept for backward compatibility) ─────
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        size: { type: String },
        color: { type: String },
        image: { type: String },
      },
    ],
    shippingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      address: { type: String },
      city: { type: String },
      zip: { type: String },
      country: { type: String },
    },

    // ─── Payment & status ─────────────────────────────────
    paymentId: { type: String },     // Razorpay Payment ID
    orderId: { type: String },       // Razorpay Order ID
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

if (models.Order) {
  delete (mongoose as any).models.Order;
}
const Order = model("Order", OrderSchema);

export default Order;
