import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export const runtime = "nodejs"

export async function PUT(request: NextRequest) {
  try {
    const { username, fullName, email, currentPassword, newPassword } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Имя пользователя обязательно" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const user = dataStore.getUser(username)

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Verify current password if changing password
    if (newPassword) {
      if (!currentPassword || user.password !== currentPassword) {
        return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 401 })
      }
    }

    const updates: any = {}
    if (fullName) updates.fullName = fullName
    if (email) updates.email = email
    if (newPassword) updates.password = newPassword

    const updatedUser = dataStore.updateUser(username, updates)

    if (!updatedUser) {
      return NextResponse.json({ error: "Ошибка обновления профиля" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Профиль успешно обновлен",
      user: {
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
