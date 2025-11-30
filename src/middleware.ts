import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

const publicRoutes = [
  "/",
  "/homepage",
  "/about_us",
  "/contact-us",
  "/policies_page",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/forgot-password/verify",
  "/auth/forgot-password/reset",
  "/auth/verification-sent",
  "/agent-marketplace",
  "/market-place",
  "/landlord",
  "/agent",
  "/referral",
  "/secure-seller-response",
  "/secure-buyer-response",
  "/continue-inspection",
  "/update-preference"
];


const userProtectedRoutes = [
  "/dashboard",
  "/profile",
  "/my-listings",
  "/post-property",
  "/payment-details",
  "/my-inspection-requests",
  "/update-property",
  "/referral",
  "/post-property-by-preference",
  "/profile-settings",
  "/notifications",
  "/field-agent-inspections",
  "/field-agent-inspection",
  "/transactions",
  "/agent-subscriptions",
  "/agent-kyc",
  "/public-access-page"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get("token")?.value;

  // Skip middleware for API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Redirect old agent auth routes to new consolidated auth
  if (pathname.startsWith("/agent/auth/login")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (pathname.startsWith("/agent/auth/register")) {
    return NextResponse.redirect(new URL("/auth/register", request.url));
  }
  // Redirect legacy /register to /auth/register while preserving query params
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    const target = new URL("/auth/register", request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  // Handle auth redirections for logged-in users
  if (userToken) {
    if (pathname === "/auth/login" || pathname === "/auth/register") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protect user routes
  const isUserProtectedRoute = userProtectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isUserProtectedRoute) {
    if (!userToken) {
      const loginUrl = new URL("/auth/login", request.url);
      const fullPath = pathname + (request.nextUrl.search || "");
      loginUrl.searchParams.set("from", fullPath);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Handle property routes - check for specific property paths
  if (pathname.startsWith("/property/")) {
    return NextResponse.next();
  }

  // Handle buy_page details
  if (pathname.startsWith("/buy_page/details/")) {
    return NextResponse.next();
  }

  // Default: allow the request to continue
  return NextResponse.next();
}
