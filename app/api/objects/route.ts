import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"
import { validatePropertyForm } from "@/lib/validation"

export const runtime = "nodejs"

export async function GET() {
  try {
    const dataStore = getDataStore()
    const properties = dataStore.getProperties()
    return NextResponse.json(properties)
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

    const dataStore = getDataStore()

    // Check if ID already exists
    if (dataStore.getProperty(data.id)) {
      return NextResponse.json({ error: "Объект с таким ID уже существует" }, { status: 400 })
    }

    const newProperty = dataStore.createProperty({
      ...data,
      owner: data.owner || "",
      ownerPhone: data.ownerPhone || "",
      photos: data.photos || [],
    })

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    dataStore.logAdminAction({
      adminUsername: username,
      action: "Создан объект",
      details: `Объект ${data.id} - ${data.address}`,
      ipAddress,
    })

    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    console.error("[v0] Create property error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
