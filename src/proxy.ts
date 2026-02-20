import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/token";

const protectedPaths = ["/account", "/orders"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname + search)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  const user = await verifyAuthToken(token);
  if (!user) {
    const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname + search)}`, request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/orders/:path*"],
};

