import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true, enum: ["women", "men", "kids"] },
    subcategory: { type: String, required: true },
    image: { type: String, required: true }, // Main Cloudinary URL
    images: { type: [String], default: [] }, // Legacy gallery URLs
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] }, // Legacy color strings
    // Color variants: each color has its own image set
    variants: {
      type: [{
        color: { type: String, required: true },
        colorHex: { type: String, default: "#000000" },
        images: { type: [String], default: [] },   // front images
        backImage: { type: String, default: "" },  // optional back image
        isDefault: { type: Boolean, default: false },
      }],
      default: [],
    },
    stock: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;
