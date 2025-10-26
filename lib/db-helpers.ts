import "server-only"
import { prisma } from "./prisma"
import type { Admin, Client, PropertyObject, Showing, Transaction } from "./db"

// Admin helpers
export async function getAdminByUsername(username: string): Promise<Admin | null> {
  return await prisma.admin.findUnique({
    where: { username },
  })
}

export async function verifyAdminPassword(username: string, password: string): Promise<Admin | null> {
  return await prisma.admin.findUnique({
    where: { username_password: { username, password } },
  })
}

// Client helpers
export async function getClients(filters?: {
  waiting_for_showing?: boolean
  is_hidden?: boolean
  id?: number
}): Promise<Client[]> {
  return await prisma.client.findMany({
    where: {
      ...(filters?.waiting_for_showing !== undefined && {
        waiting_for_showing: filters.waiting_for_showing,
      }),
      ...(filters?.is_hidden !== undefined && {
        is_hidden: filters.is_hidden,
      }),
      ...(filters?.id && {
        id: filters.id,
      }),
    },
    orderBy: { date_added: "desc" },
  })
}

export async function createClient(client: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
  return await prisma.client.create({
    data: {
      name: client.name,
      phone: client.phone,
      birth_date: client.birth_date?.toISOString() || null,
      additional_phones: client.additional_phones || [],
      notes: client.notes || null,
      call_status: client.call_status || "not_called",
      call_notes: client.call_notes || null,
      is_hidden: client.is_hidden || false,
      waiting_for_showing: client.waiting_for_showing || false,
      date_added: client.date_added?.toISOString() || new Date().toISOString(),
    },
  })
}

export async function deleteClient(id: string): Promise<void> {
  await prisma.client.delete({
    where: { id },
  })
}

// Object helpers
export async function getObjects(filters?: {
  status?: string
  id?: number
  rooms?: number
  district?: string
}): Promise<PropertyObject[]> {
  return await prisma.object.findMany({
    where: {
      ...(filters?.status && {
        status: filters.status,
      }),
      ...(filters?.id && {
        id: filters.id,
      }),
      ...(filters?.rooms && {
        rooms: filters.rooms,
      }),
      ...(filters?.district && {
        district: {
          contains: filters.district,
        },
      }),
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  })
}

export async function getObjectById(id: number): Promise<PropertyObject | null> {
  const objects = await getObjects({ id })
  return objects[0] || null
}

export async function createObject(
  obj: Omit<PropertyObject, "id" | "created_at" | "updated_at" | "owner" | "buyer">,
): Promise<PropertyObject> {
  return await prisma.object.create({
    data: {
      address: obj.address,
      district: obj.district || null,
      rooms: obj.rooms,
      area: obj.area,
      floor: obj.floor || null,
      total_floors: obj.total_floors || null,
      price: obj.price,
      description: obj.description || null,
      owner_id: obj.owner_id || null,
      buyer_id: obj.buyer_id || null,
      status: obj.status || "available",
      photos: obj.photos || [],
    },
  })
}

export async function updateObject(id: number, updates: Partial<PropertyObject>): Promise<PropertyObject> {
  return await prisma.object.update({
    where: { id },
    data: {
      ...(updates.address && { address: updates.address }),
      ...(updates.district && { district: updates.district }),
      ...(updates.rooms !== undefined && { rooms: updates.rooms }),
      ...(updates.area !== undefined && { area: updates.area }),
      ...(updates.floor !== undefined && { floor: updates.floor }),
      ...(updates.total_floors !== undefined && { total_floors: updates.total_floors }),
      ...(updates.price !== undefined && { price: updates.price }),
      ...(updates.description && { description: updates.description }),
      ...(updates.owner_id !== undefined && { owner_id: updates.owner_id }),
      ...(updates.buyer_id !== undefined && { buyer_id: updates.buyer_id }),
      ...(updates.status && { status: updates.status }),
      ...(updates.photos && { photos: updates.photos }),
      updated_at: new Date(),
    },
  })
}

export async function deleteObject(id: number): Promise<void> {
  await prisma.object.delete({
    where: { id },
  })
}

// Showing helpers
export async function getShowings(filters?: {
  object_id?: number
  client_id?: number
}): Promise<Showing[]> {
  return await prisma.showing.findMany({
    where: {
      ...(filters?.object_id && {
        object_id: filters.object_id,
      }),
      ...(filters?.client_id && {
        client_id: filters.client_id,
      }),
    },
    orderBy: { scheduled_date: "desc" },
  })
}

export async function createShowing(
  showing: Omit<Showing, "id" | "created_at" | "updated_at" | "object" | "client" | "admin">,
): Promise<Showing> {
  return await prisma.showing.create({
    data: {
      object_id: showing.object_id,
      client_id: showing.client_id,
      admin_id: showing.admin_id || null,
      scheduled_date: showing.scheduled_date.toISOString(),
      status: showing.status || "scheduled",
      notes: showing.notes || null,
    },
  })
}

export async function updateShowing(id: number, updates: Partial<Showing>): Promise<Showing> {
  return await prisma.showing.update({
    where: { id },
    data: {
      ...(updates.scheduled_date && {
        scheduled_date:
          updates.scheduled_date instanceof Date ? updates.scheduled_date.toISOString() : updates.scheduled_date,
      }),
      ...(updates.status && { status: updates.status }),
      ...(updates.notes && { notes: updates.notes }),
      updated_at: new Date(),
    },
  })
}

export async function deleteShowing(id: number): Promise<void> {
  await prisma.showing.delete({
    where: { id },
  })
}

// Transaction helpers
export async function getTransactions(): Promise<Transaction[]> {
  return await prisma.transaction.findMany({
    orderBy: { transaction_date: "desc" },
  })
}

export async function createTransaction(transaction: Omit<Transaction, "id" | "created_at">): Promise<Transaction> {
  return await prisma.transaction.create({
    data: {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || null,
      client_id: transaction.client_id || null,
      object_id: transaction.object_id || null,
      admin_id: transaction.admin_id || null,
      transaction_date: transaction.transaction_date.toISOString(),
    },
  })
}
