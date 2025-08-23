import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access signin page, redirect to dashboard
    if (req.nextUrl.pathname === "/signin" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // If user is authenticated and trying to access root page, redirect to dashboard
    if (req.nextUrl.pathname === "/" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signin") {
          return true;
        }
        
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 