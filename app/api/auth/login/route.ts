import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"
import { createAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Login attempt for username:", username)

    if (!username || !password) {
      console.log("[v0] Missing username or password")
      return NextResponse.json({ error: "Имя пользователя и пароль обязательны" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const user = dataStore.getUser(username)

    console.log("[v0] User found:", user ? "yes" : "no")

    if (!user || !dataStore.verifyUserPassword(username, password)) {
      console.log("[v0] Invalid credentials")
      return NextResponse.json({ error: "Неверное имя пользователя или пароль" }, { status: 401 })
    }

    const token = createAuthToken(username)
    console.log("[v0] Token created successfully")

    dataStore.logAdminAction({
      adminUsername: username,
      action: "Вход в систему",
      details: `Администратор ${user.fullName} вошел в систему`,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
    })

    const response = NextResponse.json({
      success: true,
      token,
      username: user.username,
      name: user.fullName,
    })

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    console.log("[v0] Login successful, cookie set")

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
