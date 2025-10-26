import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const photo = formData.get("photo") as File

    if (!photo) {
      return NextResponse.json({ error: "Фото не предоставлено" }, { status: 400 })
    }

    const property = await prisma.object.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    // In a real app, you would upload to cloud storage
    // For now, we'll just store a placeholder URL
    const photoUrl = `/uploads/${params.id}/${photo.name}`

    let photos = []
    if (property.photos) {
      try {
        photos = JSON.parse(property.photos)
      } catch (e) {
        photos = []
      }
    }
    photos.push(photoUrl)

    await prisma.object.update({
      where: { id: params.id },
      data: { photos: JSON.stringify(photos) },
    })

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

    const property = await prisma.object.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    let photos = []
    if (property.photos) {
      try {
        photos = JSON.parse(property.photos)
      } catch (e) {
        photos = []
      }
    }

    photos = photos.filter((p: string) => p !== photoPath)

    await prisma.object.update({
      where: { id: params.id },
      data: { photos: JSON.stringify(photos) },
    })

    return NextResponse.json({ message: "Фото успешно удалено" })
  } catch (error) {
    console.error("[v0] Delete photo error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
