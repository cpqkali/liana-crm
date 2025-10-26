import { type NextRequest, NextResponse } from "next/server"
import { deleteAuthToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value

    if (token) {
      deleteAuthToken(token)
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
