import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.object.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    // Transform data to match expected format
    return NextResponse.json({
      ...property,
      photos: property.photos ? JSON.parse(property.photos) : [],
      tags: property.tags ? JSON.parse(property.tags) : [],
    })
  } catch (error) {
    console.error("[v0] Get property error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const updatedProperty = await prisma.object.update({
      where: { id: params.id },
      data: {
        address: data.address,
        type: data.type,
        status: data.status,
        price: data.price,
        area: data.area,
        rooms: data.rooms || null,
        floor: data.floor || null,
        totalFloors: data.totalFloors || null,
        owner: data.owner || null,
        ownerPhone: data.ownerPhone || null,
        ownerEmail: data.ownerEmail || null,
        description: data.description || null,
        inventory: data.inventory || null,
        hasFurniture: data.hasFurniture || false,
        photos: data.photos ? JSON.stringify(data.photos) : null,
        district: data.district || null,
        notes: data.notes || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
      },
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    await logAdminAction({
      adminUsername: username,
      action: "Обновлен объект",
      details: `Объект ${params.id} - ${data.address || updatedProperty.address}`,
      ipAddress,
    })

    return NextResponse.json({
      ...updatedProperty,
      photos: updatedProperty.photos ? JSON.parse(updatedProperty.photos) : [],
      tags: updatedProperty.tags ? JSON.parse(updatedProperty.tags) : [],
    })
  } catch (error) {
    console.error("[v0] Update property error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.object.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 })
    }

    await prisma.object.delete({
      where: { id: params.id },
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    await logAdminAction({
      adminUsername: username,
      action: "Удален объект",
      details: `Объект ${params.id} - ${property.address}`,
      ipAddress,
    })

    return NextResponse.json({ message: "Объект успешно удален" })
  } catch (error) {
    console.error("[v0] Delete property error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
