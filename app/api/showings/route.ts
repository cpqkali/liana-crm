import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    const showings = await prisma.showing.findMany({
      orderBy: [{ date: "asc" }, { time: "asc" }],
    })
    return NextResponse.json(showings)
  } catch (error) {
    console.error("[v0] Get showings error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
