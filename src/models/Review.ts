import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // optional — guests can review
    name: { type: String, required: true, maxlength: 60, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10, maxlength: 500, trim: true },
    verified: { type: Boolean, default: false }, // true if user has a delivered order for this product
  },
  { timestamps: true }
);

// Prevent multiple reviews from the same user for the same product within 24h
ReviewSchema.index({ productId: 1, userId: 1 });

const Review = models.Review || model("Review", ReviewSchema);
export default Review;
