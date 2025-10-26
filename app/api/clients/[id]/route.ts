import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("[v0] Get client error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: data.name,
        phone: data.phone,
        callStatus: data.callStatus,
        type: data.type,
        status: data.status,
        budget: data.budget || null,
        notes: data.notes || null,
      },
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    await logAdminAction({
      adminUsername: username,
      action: "Обновлен клиент",
      details: `Клиент ${data.name} - ${data.phone}`,
      ipAddress,
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("[v0] Update client error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 })
    }

    await prisma.client.delete({
      where: { id: params.id },
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    await logAdminAction({
      adminUsername: username,
      action: "Удален клиент",
      details: `Клиент ${client.name} - ${client.phone}`,
      ipAddress,
    })

    return NextResponse.json({ message: "Клиент успешно удален" })
  } catch (error) {
    console.error("[v0] Delete client error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
