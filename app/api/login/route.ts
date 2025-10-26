import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/db"
import { createAuthToken } from "@/lib/auth"
import bcryptjs from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await bcryptjs.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = createAuthToken(user.id, user.username)

    await logAdminAction({
      adminUsername: username,
      action: "Вход в систему",
      details: `Пользователь ${username} вошел в систему`,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
    })

    return NextResponse.json({
      token,
      user: { id: user.id, username: user.username },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
