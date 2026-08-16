import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Supabase connection with defaults
  const DEFAULT_SUPABASE_URL = "https://fvuhclexexsfzxsexzfu.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_DkjrWg1NOUeSjZ7cB4HZ2g_4m44sB2k";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "http://localhost:54321" ||
    supabaseAnonKey.includes("placeholder")
  ) {
    // Supabase belum dikonfigurasi — skip auth, biarkan semua request lewat
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: DO NOT use getSession() — it reads from storage without
  // validation. Always use getUser() for server-side auth checks.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kalau belum login dan bukan di halaman publik, redirect ke /login
  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/lacak") ||
    request.nextUrl.pathname.startsWith("/tracking") ||
    request.nextUrl.pathname.startsWith("/api/documents") ||
    request.nextUrl.pathname.startsWith("/api/wa");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Kalau sudah login tapi akses /login, redirect ke beranda
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
