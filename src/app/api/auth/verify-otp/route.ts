import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      // Clear expired OTP
      await User.updateOne({ email }, { $unset: { otp: "", otpExpiry: "" } });
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 401 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    // OTP valid — clear it immediately (one-time use)
    await User.updateOne({ email }, { $unset: { otp: "", otpExpiry: "" } });

    return NextResponse.json({
      verified: true,
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    console.error("verify-otp error:", error.message);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
