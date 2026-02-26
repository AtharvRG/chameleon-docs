import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { user } = req.auth || {};

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};