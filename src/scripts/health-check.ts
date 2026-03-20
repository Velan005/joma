import connectToDatabase from "../lib/mongoose";
import Product from "../models/Product";
import User from "../models/User";
import Order from "../models/Order";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkSystem() {
  console.log("--- 🕵️ System Health Check ---");
  
  try {
    console.log("1. Testing MongoDB Connection...");
    await connectToDatabase();
    console.log("✅ Database connected successfully.");

    console.log("\n2. Checking Collections...");
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`- Products: ${productCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Orders: ${orderCount}`);

    if (productCount === 0) {
      console.log("⚠️ Warning: No products found in DB.");
    }

    console.log("\n3. Testing Environment Variables...");
    const requiredEnv = [
      "MONGODB_URI",
      "NEXTAUTH_SECRET",
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "CLOUDINARY_CLOUD_NAME"
    ];

    requiredEnv.forEach(env => {
      if (process.env[env]) {
        console.log(`✅ ${env} is set.`);
      } else {
        console.log(`❌ ${env} is MISSING.`);
      }
    });

    console.log("\n--- ✨ Check Complete ---");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ System Check Failed:");
    console.error(error);
    process.exit(1);
  }
}

checkSystem();
