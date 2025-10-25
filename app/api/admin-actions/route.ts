import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { adminUsername, action, details } = data

    if (!adminUsername || !action || !details) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
    }

    // Get IP address from request
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    const dataStore = getDataStore()
    const newAction = dataStore.logAdminAction({
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
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    const dataStore = getDataStore()
    const actions = username ? dataStore.getAdminActions(username) : dataStore.getAdminActions()

    return NextResponse.json(actions)
  } catch (error) {
    console.error("[v0] Get admin actions error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
