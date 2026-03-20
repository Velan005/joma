import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@joma.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  try {
    console.log("--- 🔐 Seeding Admin User ---");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection failed");
    const usersCollection = db.collection("users");

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`);
      console.log("   Skipping creation to avoid duplicates.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin user
    const result = await usersCollection.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Name:  ${ADMIN_NAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   ID:    ${result.insertedId}`);
    console.log("\n💡 You can now log in at /account with these credentials.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();
