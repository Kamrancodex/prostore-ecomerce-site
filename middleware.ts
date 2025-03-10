// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Create a response first
  const response = NextResponse.next();

  // Check for session cart cookie
  if (!request.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    // Set the cookie on the response object
    response.cookies.set("sessionCartId", sessionCartId);
  }

  // Always return the response
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
