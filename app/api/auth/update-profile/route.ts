import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { createAuthToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function PUT(request: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Имя пользователя обязательно" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Verify current password if changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Текущий пароль обязателен" }, { status: 400 })
      }

      const isValidPassword = await bcryptjs.compare(currentPassword, user.password)

      if (!isValidPassword) {
        return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 401 })
      }
    }

    const updateData: any = {}
    if (newPassword) {
      updateData.password = await bcryptjs.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { username },
      data: updateData,
    })

    const token = createAuthToken(updatedUser.id, updatedUser.username)

    return NextResponse.json({
      message: "Профиль успешно обновлен",
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
      },
    })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
