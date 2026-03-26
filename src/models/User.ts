import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    image: { type: String },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    otp: { type: String },
    otpExpiry: { type: Date },
    otpRateLimit: { type: Date }, // Separate from expiry — controls how soon they can re-request
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
