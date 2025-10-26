import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/db"
import { validatePropertyForm } from "@/lib/validation"

export const runtime = "nodejs"

export async function GET() {
  try {
    const properties = await prisma.object.findMany({
      orderBy: { createdAt: "desc" },
    })

    // Transform data to match expected format
    const transformedProperties = properties.map((p) => ({
      ...p,
      photos: p.photos ? JSON.parse(p.photos) : [],
      tags: p.tags ? JSON.parse(p.tags) : [],
    }))

    return NextResponse.json(transformedProperties)
  } catch (error) {
    console.error("[v0] Get properties error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const validation = validatePropertyForm({
      id: data.id,
      address: data.address,
      price: data.price?.toString() || "",
      area: data.area?.toString() || "",
      status: data.status,
      owner: data.owner || "",
      ownerPhone: data.ownerPhone || "",
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const existing = await prisma.object.findUnique({
      where: { id: data.id },
    })

    if (existing) {
      return NextResponse.json({ error: "Объект с таким ID уже существует" }, { status: 400 })
    }

    const newProperty = await prisma.object.create({
      data: {
        id: data.id,
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
        photos: JSON.stringify(data.photos || []),
        district: data.district || null,
        notes: data.notes || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
      },
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    await logAdminAction({
      adminUsername: username,
      action: "Создан объект",
      details: `Объект ${data.id} - ${data.address}`,
      ipAddress,
    })

    return NextResponse.json(
      {
        ...newProperty,
        photos: newProperty.photos ? JSON.parse(newProperty.photos) : [],
        tags: newProperty.tags ? JSON.parse(newProperty.tags) : [],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Create property error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
