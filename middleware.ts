import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get("authToken")?.value

  if (!authToken) {
    const loginUrl = new URL("/", request.url)
    return NextResponse.redirect(loginUrl)
  }

  const tokenData = verifyAuthToken(authToken)

  if (!tokenData) {
    const loginUrl = new URL("/", request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("authToken")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - / (login page)
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - /static/* (static files)
     * - /*.* (files with extensions like .ico, .jpg, etc.)
     */
    "/((?!api|_next|static|.*\\..*).*)",
  ],
}
