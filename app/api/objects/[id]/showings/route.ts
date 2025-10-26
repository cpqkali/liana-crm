import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const showings = await prisma.showing.findMany({
      where: { objectId: params.id },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    })
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

    const property = await prisma.object.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    const showingId = `SHW-${Date.now()}`

    const newShowing = await prisma.showing.create({
      data: {
        id: showingId,
        objectId: params.id,
        date: data.date,
        time: data.time,
        notes: data.notes || null,
      },
    })

    return NextResponse.json(newShowing, { status: 201 })
  } catch (error) {
    console.error("[v0] Create showing error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
