import { type NextRequest, NextResponse } from "next/server"
import { logAdminAction, getAdminActions } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { adminUsername, action, details } = data

    if (!adminUsername || !action || !details) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
    }

    // Get IP address from request
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    const newAction = await logAdminAction({
      adminUsername,
      action,
      details,
      ipAddress,
    })

    return NextResponse.json(newAction, { status: 201 })
  } catch (error) {
    console.error("[v0] Log admin action error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    const actions = await getAdminActions(username || undefined)

    return NextResponse.json({ actions })
  } catch (error) {
    console.error("[v0] Get admin actions error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
