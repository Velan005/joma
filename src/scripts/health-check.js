const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

async function checkSystem() {
  console.log("--- 🕵️ System Health Check (JS) ---");
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  try {
    console.log("1. Testing MongoDB Connection...");
    await mongoose.connect(uri);
    console.log("✅ Database connected successfully.");

    console.log("\n2. Checking Collections...");
    
    // Use raw connection to count documents to avoid importing models
    const products = await mongoose.connection.db.collection("products").countDocuments();
    const users = await mongoose.connection.db.collection("users").countDocuments();
    const orders = await mongoose.connection.db.collection("orders").countDocuments();
    
    console.log(`- Products: ${products}`);
    console.log(`- Users: ${users}`);
    console.log(`- Orders: ${orders}`);

    console.log("\n3. Verifying Critical Environment Variables...");
    const requiredEnv = [
      "MONGODB_URI",
      "NEXTAUTH_SECRET",
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "CLOUDINARY_CLOUD_NAME"
    ];

    requiredEnv.forEach(env => {
      if (process.env[env]) {
         // Mask sensitive info
         const val = process.env[env];
         const masked = val.length > 8 ? val.substring(0, 4) + "****" + val.substring(val.length - 4) : "****";
         console.log(`✅ ${env} is set: ${masked}`);
      } else {
         console.log(`❌ ${env} is MISSING.`);
      }
    });

    console.log("\n--- ✨ Check Complete ---");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ System Check Failed:");
    console.error(error.message);
    process.exit(1);
  }
}

checkSystem();
