import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get("authToken")?.value

    if (!authToken || !verifyAuthToken(authToken)) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    await prisma.showing.deleteMany()
    await prisma.object.deleteMany()
    await prisma.client.deleteMany()
    await prisma.adminAction.deleteMany()

    return NextResponse.json({ success: true, message: "База данных успешно очищена" })
  } catch (error) {
    console.error("[v0] Clear database error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
