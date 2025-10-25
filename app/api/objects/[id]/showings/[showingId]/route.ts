import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export async function PUT(request: NextRequest, { params }: { params: { id: string; showingId: string } }) {
  try {
    const data = await request.json()
    const dataStore = getDataStore()

    const updatedShowing = dataStore.updateShowing(params.showingId, data)

    if (!updatedShowing) {
      return NextResponse.json({ error: "Показ не найден" }, { status: 404 })
    }

    return NextResponse.json(updatedShowing)
  } catch (error) {
    console.error("[v0] Update showing error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; showingId: string } }) {
  try {
    const dataStore = getDataStore()
    const success = dataStore.deleteShowing(params.showingId)

    if (!success) {
      return NextResponse.json({ error: "Показ не найден" }, { status: 404 })
    }

    return NextResponse.json({ message: "Показ успешно удален" })
  } catch (error) {
    console.error("[v0] Delete showing error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
