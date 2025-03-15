import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  console.log("pathname from req", pathname);

  // Paths that require authentication
  const protectedPaths = [
    /\/shipping-address/,
    /\/payment-method/,
    /\/place-order/,
    /\/profile/,
    /\/user\/(.*)/,
    /\/order\/(.*)/,
    /\/admin/,
  ];
  console.log(protectedPaths);
  console.log("auth secret", process.env.NEXTAUTH_SECRET);

  // Get authentication token from cookies
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.log("token from middleware", token);
  console.log("cookies", request.cookies);

  if (!token && protectedPaths.some((p) => p.test(pathname))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Check for session cart cookie
  if (!request.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    response.cookies.set("sessionCartId", sessionCartId);
  }

  return response;
}

// Define middleware matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
