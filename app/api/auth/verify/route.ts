import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authToken =
      request.cookies.get("authToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!authToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const tokenData = verifyAuthToken(authToken)

    if (!tokenData) {
      return NextResponse.json({ authenticated: false, error: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      username: tokenData.username,
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Server error" }, { status: 500 })
  }
}
