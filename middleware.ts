import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ["/dashboard"];

  const pathname = req.nextUrl.pathname;

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return res;
}
