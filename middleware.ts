import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    console.log("Middleware token:", token); // Add logging

    // If accessing admin routes, check if user is admin
    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      if (token.role !== "ADMIN") {
        console.log("Access denied - User role:", token.role); // Add logging
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Auth callback token:", token); // Add logging
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};