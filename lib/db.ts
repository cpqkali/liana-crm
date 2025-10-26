import "server-only"
import { prisma } from "./prisma"
import bcryptjs from "bcryptjs"

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL not set. Using default connection.")
}

export async function getDb() {
  return prisma
}

export async function initializeSchema() {
  // Schema is now managed by Prisma migrations
  // Check if default users exist
  const adminCount = await prisma.user.count()

  if (adminCount === 0) {
    const hashedAdmin = await bcryptjs.hash("admin123", 10)
    const hashedElena = await bcryptjs.hash("12345", 10)
    const hashedAnna = await bcryptjs.hash("09876", 10)

    // Insert default admin users
    await prisma.user.createMany({
      data: [
        {
          username: "admin",
          password: hashedAdmin,
        },
        {
          username: "Elena",
          password: hashedElena,
        },
        {
          username: "Anna",
          password: hashedAnna,
        },
      ],
    })
  }
}

export async function logAdminAction(data: {
  adminUsername: string
  action: string
  details: string
  ipAddress: string
}) {
  const id = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return await prisma.adminAction.create({
    data: {
      id,
      adminUsername: data.adminUsername,
      action: data.action,
      details: data.details,
      ipAddress: data.ipAddress,
    },
  })
}

export async function getAdminActions(username?: string) {
  if (username) {
    return await prisma.adminAction.findMany({
      where: { adminUsername: username },
      orderBy: { timestamp: "desc" },
    })
  }

  return await prisma.adminAction.findMany({
    orderBy: { timestamp: "desc" },
  })
}

export async function getAllAdminUsernames() {
  const actions = await prisma.adminAction.findMany({
    select: { adminUsername: true },
    distinct: ["adminUsername"],
  })

  return actions.map((a) => a.adminUsername)
}

// Helper function to format price
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн`
  }
  return price.toLocaleString("ru-RU")
}

export interface Admin {
  id: number
  username: string
  createdAt: Date
}

export interface Client {
  id: string
  name: string
  phone: string
  callStatus: string
  type: string
  status: string
  budget?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Property {
  id: string
  address: string
  type: string
  status: string
  price: number
  area: number
  rooms?: number | null
  floor?: number | null
  totalFloors?: number | null
  owner?: string | null
  ownerPhone?: string | null
  ownerEmail?: string | null
  description?: string | null
  inventory?: string | null
  hasFurniture: boolean
  photos?: string[]
  district?: string | null
  notes?: string | null
  tags?: string[]
  createdAt: Date | string
  updatedAt?: Date | string
}

export interface PropertyObject {
  id: string
  address: string
  district?: string | null
  rooms?: number | null
  area: number
  floor?: number | null
  totalFloors?: number | null
  price: number
  description?: string | null
  owner?: string | null
  ownerPhone?: string | null
  status: string
  photos?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Showing {
  id: string
  objectId: string
  date: string
  time: string
  notes?: string | null
  createdAt: Date
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description?: string | null
  transactionDate: Date
  createdAt: Date
}

export interface AdminAction {
  id: string
  adminUsername: string
  action: string
  details: string
  ipAddress: string
  timestamp: Date
}
