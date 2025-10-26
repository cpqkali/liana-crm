import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const photo = formData.get("photo") as File

    if (!photo) {
      return NextResponse.json({ error: "Фото не предоставлено" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const property = dataStore.getProperty(params.id)

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    // In a real app, you would upload to cloud storage
    // For now, we'll just store a placeholder URL
    const photoUrl = `/uploads/${params.id}/${photo.name}`
    const photos = [...(property.photos || []), photoUrl]

    dataStore.updateProperty(params.id, { photos })

    return NextResponse.json({ photoUrl, message: "Фото успешно загружено" })
  } catch (error) {
    console.error("[v0] Upload photo error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { photoPath } = await request.json()

    if (!photoPath) {
      return NextResponse.json({ error: "Путь к фото не предоставлен" }, { status: 400 })
    }

    const dataStore = getDataStore()
    const property = dataStore.getProperty(params.id)

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    const photos = (property.photos || []).filter((p) => p !== photoPath)
    dataStore.updateProperty(params.id, { photos })

    return NextResponse.json({ message: "Фото успешно удалено" })
  } catch (error) {
    console.error("[v0] Delete photo error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
