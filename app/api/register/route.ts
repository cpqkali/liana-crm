import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create new user
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Register error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
