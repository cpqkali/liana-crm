import { NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export const runtime = "nodejs"

export async function GET() {
  try {
    const dataStore = getDataStore()
    const showings = dataStore.getShowings()
    return NextResponse.json(showings)
  } catch (error) {
    console.error("[v0] Get showings error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
