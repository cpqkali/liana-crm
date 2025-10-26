import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string; showingId: string } }) {
  try {
    const data = await request.json()

    const updatedShowing = await prisma.showing.update({
      where: { id: params.showingId },
      data: {
        date: data.date,
        time: data.time,
        notes: data.notes || null,
      },
    })

    return NextResponse.json(updatedShowing)
  } catch (error) {
    console.error("[v0] Update showing error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; showingId: string } }) {
  try {
    await prisma.showing.delete({
      where: { id: params.showingId },
    })

    return NextResponse.json({ message: "Показ успешно удален" })
  } catch (error) {
    console.error("[v0] Delete showing error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
