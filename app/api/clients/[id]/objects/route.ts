import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const objects = await prisma.object.findMany({
      where: { owner: params.id },
      orderBy: { createdAt: "desc" },
    })

    // Transform data to match expected format
    const transformedObjects = objects.map((obj) => ({
      ...obj,
      photos: obj.photos ? JSON.parse(obj.photos) : [],
      tags: obj.tags ? JSON.parse(obj.tags) : [],
    }))

    return NextResponse.json(transformedObjects)
  } catch (error) {
    console.error("[v0] Get client objects error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
