import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataStore = getDataStore()
    const showings = dataStore.getShowingsByObject(params.id)
    return NextResponse.json(showings)
  } catch (error) {
    console.error("[v0] Get showings error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    if (!data.date || !data.time) {
      return NextResponse.json({ error: "Дата и время обязательны" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const property = dataStore.getProperty(params.id)

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    const newShowing = dataStore.createShowing({
      objectId: params.id,
      date: data.date,
      time: data.time,
      notes: data.notes || "",
    })

    return NextResponse.json(newShowing, { status: 201 })
  } catch (error) {
    console.error("[v0] Create showing error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
