import { type NextRequest, NextResponse } from "next/server"
import { getClientById, updateClient, deleteClient } from "@/lib/db-helpers"
import { getDataStore } from "@/lib/data-store"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await getClientById(Number.parseInt(params.id))

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

    const updatedClient = await updateClient(Number.parseInt(params.id), {
      name: data.name,
      phone: data.phone,
      birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      additional_phones: data.additional_phones,
      notes: data.notes,
      call_status: data.call_status,
      call_notes: data.call_notes,
      is_hidden: data.is_hidden,
      waiting_for_showing: data.waiting_for_showing,
    })

    const dataStore = getDataStore()
    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    dataStore.logAdminAction({
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
    const client = await getClientById(Number.parseInt(params.id))

    await deleteClient(Number.parseInt(params.id))

    const dataStore = getDataStore()
    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    dataStore.logAdminAction({
      adminUsername: username,
      action: "Удален клиент",
      details: `Клиент ${client?.name || "Unknown"} - ${client?.phone || "Unknown"}`,
      ipAddress,
    })

    return NextResponse.json({ message: "Клиент успешно удален" })
  } catch (error) {
    console.error("[v0] Delete client error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
