import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/admin", "/provider", "/portal", "/landlord"] as const;

const roleByPrefix: Record<(typeof protectedPrefixes)[number], string> = {
  "/admin": "Admin",
  "/provider": "Provider",
  "/portal": "Customer",
  "/landlord": "Landlord",
};

function portalPathForRole(role: string) {
  if (role === "Admin") return "/admin";
  if (role === "Provider") return "/provider";
  if (role === "Landlord") return "/landlord";
  return "/portal";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = protectedPrefixes.find((p) => pathname.startsWith(p));
  if (!prefix) {
    return NextResponse.next();
  }

  if (!request.cookies.get("sorted_session")?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = roleByPrefix[prefix];
  const sessionRole = request.cookies.get("sorted_role")?.value;
  if (!sessionRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (sessionRole !== requiredRole) {
    return NextResponse.redirect(new URL(portalPathForRole(sessionRole), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*", "/portal/:path*", "/landlord/:path*"],
};
