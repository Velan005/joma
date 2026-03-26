import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, name } = await req.json();

    if (!email || !phone) {
      return NextResponse.json({ error: "Email and phone are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await connectToDatabase();

    // Rate limit: prevent spamming — separate from OTP validity
    const existingUser = await User.findOne({ email });
    if (existingUser?.otpRateLimit && existingUser.otpRateLimit > new Date()) {
      const secondsLeft = Math.ceil((existingUser.otpRateLimit.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Please wait ${secondsLeft}s before requesting a new code` },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min validity for verification
    const rateLimitExpiry = new Date(Date.now() + 60 * 1000); // 60 sec before they can re-request

    // Derive name from email prefix if not provided
    const userName = name?.trim() || email.split("@")[0];

    // Upsert user — save OTP to DB first so it exists when verify is called
    await User.findOneAndUpdate(
      { email },
      {
        $set: { phone, otp, otpExpiry, otpRateLimit: rateLimitExpiry },
        $setOnInsert: { name: userName, role: "customer" },
      },
      { upsert: true, new: true }
    );

    // Send email — if this fails, clear the expiry so the customer can retry immediately
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError: any) {
      // Clear OTP and rate-limit so the customer can retry immediately
      await User.findOneAndUpdate({ email }, { $unset: { otp: "", otpExpiry: "", otpRateLimit: "" } });
      console.error("send-otp email error:", emailError.message);
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent" });
  } catch (error: any) {
    console.error("send-otp error:", error.message);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
