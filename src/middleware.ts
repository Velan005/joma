import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin route protection — redirect non-admins to home
    if (pathname.startsWith("/dashboard") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
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
    // Removed /api/:path* — JWT was being decoded on every API call (public + private)
    // Admin API routes protect themselves individually with getServerSession()
  ],
};
