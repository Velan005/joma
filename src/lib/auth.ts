import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isOtpLogin: { label: "OTP Login", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        if (credentials.isOtpLogin === "true") {
          // Customer OTP path — OTP already verified by /api/auth/verify-otp
          // OTP was cleared from DB on successful verification, so we just create the session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // Admin password path
        if (!credentials.password) {
          throw new Error("Password is required");
        }
        if (!user.password) {
          throw new Error("This account uses OTP login");
        }
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Incorrect password");
        }
        if (user.role !== "admin") {
          throw new Error("Admin access only");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/account", // Custom sign in page
  },
  secret: process.env.NEXTAUTH_SECRET,
};
