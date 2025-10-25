import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters: any = {}

    if (searchParams.get("waiting_for_showing") === "true") {
      filters.waiting_for_showing = true
    }
    if (searchParams.get("is_hidden") === "true") {
      filters.is_hidden = true
    }
    if (searchParams.get("id")) {
      filters.id = Number.parseInt(searchParams.get("id")!)
    }

    const dataStore = getDataStore()
    const clients = dataStore.getClients(filters)
    return NextResponse.json(clients)
  } catch (error) {
    console.error("[v0] Get clients error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.name?.trim() || !data.phone?.trim()) {
      return NextResponse.json({ error: "Имя и телефон обязательны" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const newClient = dataStore.createClient({
      name: data.name,
      phone: data.phone,
      callStatus: data.call_status || "not_called",
      type: data.type || "buyer",
      status: data.status || "active",
      budget: data.budget,
      notes: data.notes,
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    dataStore.logAdminAction({
      adminUsername: username,
      action: "Создан клиент",
      details: `Клиент ${data.name} - ${data.phone}`,
      ipAddress,
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("[v0] Create client error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
