import { type NextRequest, NextResponse } from "next/server"
import { getObjectsByOwnerId } from "@/lib/db-helpers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const objects = await getObjectsByOwnerId(Number.parseInt(params.id))
    return NextResponse.json(objects)
  } catch (error) {
    console.error("[v0] Get client objects error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
