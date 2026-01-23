import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes - cần đăng nhập
const protectedRoutes = ["/booking-success"];

// Public routes - không cần đăng nhập
const publicRoutes = ["/login", "/signup", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // For protected routes, we'll check auth on client-side
  // because Cognito auth state is managed client-side
  // This middleware is mainly for future server-side auth checks

  // Allow all routes for now - auth is handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

