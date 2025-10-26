import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    })
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

    const clientId = `CLI-${String(Date.now()).slice(-6)}`

    const newClient = await prisma.client.create({
      data: {
        id: clientId,
        name: data.name,
        phone: data.phone,
        callStatus: data.callStatus || "not_called",
        type: data.type || "buyer",
        status: data.status || "active",
        budget: data.budget || null,
        notes: data.notes || null,
      },
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    await logAdminAction({
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
