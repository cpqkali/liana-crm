import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"
import { createAuthToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Имя пользователя и пароль обязательны" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const user = dataStore.getUser(username)

    if (!user || !dataStore.verifyUserPassword(username, password)) {
      return NextResponse.json({ error: "Неверное имя пользователя или пароль" }, { status: 401 })
    }

    const token = createAuthToken(username)

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
      sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
