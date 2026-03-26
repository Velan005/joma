import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const { pathname } = req.nextUrl;
    
    // Admin route protection
    if (pathname.startsWith("/dashboard") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect API routes with 401 instead of redirect if unauthorized
    if (pathname.startsWith("/api/")) {
      // Admin API routes
      if (pathname.startsWith("/api/admin") && token?.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/api/:path*", // Match all API routes and handle logic
  ],
};
