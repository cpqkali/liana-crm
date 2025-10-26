import "server-only"
import { getDb } from "./db"
import type { Admin, Client, PropertyObject, Showing, Transaction } from "./db"

// Admin helpers
export async function getAdminByUsername(username: string): Promise<Admin | null> {
  const db = getDb()
  const stmt = db.prepare("SELECT id, username, name, created_at FROM admins WHERE username = ?")
  return (stmt.get(username) as Admin | undefined) || null
}

export async function verifyAdminPassword(username: string, password: string): Promise<Admin | null> {
  const db = getDb()
  const stmt = db.prepare("SELECT id, username, name, created_at FROM admins WHERE username = ? AND password = ?")
  return (stmt.get(username, password) as Admin | undefined) || null
}

// Client helpers
export async function getClients(filters?: {
  waiting_for_showing?: boolean
  is_hidden?: boolean
  id?: number
}): Promise<Client[]> {
  const db = getDb()
  let query = "SELECT * FROM clients WHERE 1=1"
  const params: any[] = []

  if (filters?.waiting_for_showing !== undefined) {
    query += " AND waiting_for_showing = ?"
    params.push(filters.waiting_for_showing ? 1 : 0)
  }

  if (filters?.is_hidden !== undefined) {
    query += " AND is_hidden = ?"
    params.push(filters.is_hidden ? 1 : 0)
  }

  if (filters?.id) {
    query += " AND id = ?"
    params.push(filters.id)
  }

  query += " ORDER BY date_added DESC"

  const stmt = db.prepare(query)
  const rows = stmt.all(...params) as any[]

  // Parse JSON fields and convert boolean integers
  return rows.map((row) => ({
    ...row,
    additional_phones: row.additional_phones ? JSON.parse(row.additional_phones) : [],
    is_hidden: Boolean(row.is_hidden),
    waiting_for_showing: Boolean(row.waiting_for_showing),
    birth_date: row.birth_date ? new Date(row.birth_date) : undefined,
    date_added: new Date(row.date_added),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }))
}

export async function getClientById(id: number): Promise<Client | null> {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM clients WHERE id = ?")
  const row = stmt.get(id) as any

  if (!row) return null

  return {
    ...row,
    additional_phones: row.additional_phones ? JSON.parse(row.additional_phones) : [],
    is_hidden: Boolean(row.is_hidden),
    waiting_for_showing: Boolean(row.waiting_for_showing),
    birth_date: row.birth_date ? new Date(row.birth_date) : undefined,
    date_added: new Date(row.date_added),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

export async function createClient(client: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO clients (name, phone, birth_date, additional_phones, notes, call_status, call_notes, is_hidden, waiting_for_showing, date_added)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    client.name,
    client.phone,
    client.birth_date?.toISOString() || null,
    JSON.stringify(client.additional_phones || []),
    client.notes || null,
    client.call_status || "not_called",
    client.call_notes || null,
    client.is_hidden ? 1 : 0,
    client.waiting_for_showing ? 1 : 0,
    client.date_added?.toISOString() || new Date().toISOString(),
  )

  return getClientById(Number(result.lastInsertRowid)) as Promise<Client>
}

export async function updateClient(id: number, updates: Partial<Client>): Promise<Client> {
  const db = getDb()
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id" && key !== "created_at" && value !== undefined) {
      if (key === "additional_phones") {
        fields.push(`${key} = ?`)
        values.push(JSON.stringify(value))
      } else if (key === "is_hidden" || key === "waiting_for_showing") {
        fields.push(`${key} = ?`)
        values.push(value ? 1 : 0)
      } else if (key === "birth_date" || key === "date_added") {
        fields.push(`${key} = ?`)
        values.push(value instanceof Date ? value.toISOString() : value)
      } else {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    }
  })

  fields.push("updated_at = CURRENT_TIMESTAMP")
  values.push(id)

  const stmt = db.prepare(`UPDATE clients SET ${fields.join(", ")} WHERE id = ?`)
  stmt.run(...values)

  return getClientById(id) as Promise<Client>
}

export async function deleteClient(id: number): Promise<void> {
  const db = getDb()
  const stmt = db.prepare("DELETE FROM clients WHERE id = ?")
  stmt.run(id)
}

// Object helpers
export async function getObjects(filters?: {
  status?: string
  id?: number
  rooms?: number
  district?: string
}): Promise<PropertyObject[]> {
  const db = getDb()
  let query = `
    SELECT o.*, 
           owner.id as owner_id, owner.name as owner_name, owner.phone as owner_phone,
           buyer.id as buyer_id, buyer.name as buyer_name, buyer.phone as buyer_phone
    FROM objects o
    LEFT JOIN clients owner ON o.owner_id = owner.id
    LEFT JOIN clients buyer ON o.buyer_id = buyer.id
    WHERE 1=1
  `
  const params: any[] = []

  if (filters?.status) {
    query += " AND o.status = ?"
    params.push(filters.status)
  }

  if (filters?.id) {
    query += " AND o.id = ?"
    params.push(filters.id)
  }

  if (filters?.rooms) {
    query += " AND o.rooms = ?"
    params.push(filters.rooms)
  }

  if (filters?.district) {
    query += " AND o.district LIKE ?"
    params.push(`%${filters.district}%`)
  }

  query += ` ORDER BY 
    CASE o.status 
      WHEN 'has_candidates' THEN 1 
      WHEN 'available' THEN 2 
      WHEN 'sold' THEN 3 
    END,
    o.created_at DESC
  `

  const stmt = db.prepare(query)
  const rows = stmt.all(...params) as any[]

  return rows.map((row) => ({
    id: row.id,
    address: row.address,
    district: row.district,
    rooms: row.rooms,
    area: row.area,
    floor: row.floor,
    total_floors: row.total_floors,
    price: row.price,
    description: row.description,
    owner_id: row.owner_id,
    buyer_id: row.buyer_id,
    status: row.status,
    photos: row.photos ? JSON.parse(row.photos) : [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    owner: row.owner_id ? ({ id: row.owner_id, name: row.owner_name, phone: row.owner_phone } as any) : undefined,
    buyer: row.buyer_id ? ({ id: row.buyer_id, name: row.buyer_name, phone: row.buyer_phone } as any) : undefined,
  }))
}

export async function getObjectById(id: number): Promise<PropertyObject | null> {
  const objects = await getObjects({ id })
  return objects[0] || null
}

export async function getObjectsByOwnerId(ownerId: number): Promise<PropertyObject[]> {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT o.*, 
           buyer.id as buyer_id, buyer.name as buyer_name, buyer.phone as buyer_phone
    FROM objects o
    LEFT JOIN clients buyer ON o.buyer_id = buyer.id
    WHERE o.owner_id = ?
    ORDER BY o.created_at DESC
  `)

  const rows = stmt.all(ownerId) as any[]

  return rows.map((row) => ({
    id: row.id,
    address: row.address,
    district: row.district,
    rooms: row.rooms,
    area: row.area,
    floor: row.floor,
    total_floors: row.total_floors,
    price: row.price,
    description: row.description,
    owner_id: row.owner_id,
    buyer_id: row.buyer_id,
    status: row.status,
    photos: row.photos ? JSON.parse(row.photos) : [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    buyer: row.buyer_id ? ({ id: row.buyer_id, name: row.buyer_name, phone: row.buyer_phone } as any) : undefined,
  }))
}

export async function createObject(
  obj: Omit<PropertyObject, "id" | "created_at" | "updated_at" | "owner" | "buyer">,
): Promise<PropertyObject> {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO objects (address, district, rooms, area, floor, total_floors, price, description, owner_id, buyer_id, status, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    obj.address,
    obj.district || null,
    obj.rooms,
    obj.area,
    obj.floor || null,
    obj.total_floors || null,
    obj.price,
    obj.description || null,
    obj.owner_id || null,
    obj.buyer_id || null,
    obj.status || "available",
    JSON.stringify(obj.photos || []),
  )

  return getObjectById(Number(result.lastInsertRowid)) as Promise<PropertyObject>
}

export async function updateObject(id: number, updates: Partial<PropertyObject>): Promise<PropertyObject> {
  const db = getDb()
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id" && key !== "created_at" && key !== "owner" && key !== "buyer" && value !== undefined) {
      if (key === "photos") {
        fields.push(`${key} = ?`)
        values.push(JSON.stringify(value))
      } else {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    }
  })

  fields.push("updated_at = CURRENT_TIMESTAMP")
  values.push(id)

  const stmt = db.prepare(`UPDATE objects SET ${fields.join(", ")} WHERE id = ?`)
  stmt.run(...values)

  return getObjectById(id) as Promise<PropertyObject>
}

export async function deleteObject(id: number): Promise<void> {
  const db = getDb()
  const stmt = db.prepare("DELETE FROM objects WHERE id = ?")
  stmt.run(id)
}

// Showing helpers
export async function getShowings(filters?: {
  object_id?: number
  client_id?: number
}): Promise<Showing[]> {
  const db = getDb()
  let query = `
    SELECT s.*,
           o.address as object_address,
           c.name as client_name,
           a.name as admin_name
    FROM showings s
    LEFT JOIN objects o ON s.object_id = o.id
    LEFT JOIN clients c ON s.client_id = c.id
    LEFT JOIN admins a ON s.admin_id = a.id
    WHERE 1=1
  `
  const params: any[] = []

  if (filters?.object_id) {
    query += " AND s.object_id = ?"
    params.push(filters.object_id)
  }

  if (filters?.client_id) {
    query += " AND s.client_id = ?"
    params.push(filters.client_id)
  }

  query += " ORDER BY s.scheduled_date DESC"

  const stmt = db.prepare(query)
  const rows = stmt.all(...params) as any[]

  return rows.map((row) => ({
    id: row.id,
    object_id: row.object_id,
    client_id: row.client_id,
    admin_id: row.admin_id,
    scheduled_date: new Date(row.scheduled_date),
    status: row.status,
    notes: row.notes,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }))
}

export async function createShowing(
  showing: Omit<Showing, "id" | "created_at" | "updated_at" | "object" | "client" | "admin">,
): Promise<Showing> {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO showings (object_id, client_id, admin_id, scheduled_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    showing.object_id,
    showing.client_id,
    showing.admin_id || null,
    showing.scheduled_date.toISOString(),
    showing.status || "scheduled",
    showing.notes || null,
  )

  const id = Number(result.lastInsertRowid)
  const showings = await getShowings({ object_id: showing.object_id })
  return showings.find((s) => s.id === id)!
}

export async function updateShowing(id: number, updates: Partial<Showing>): Promise<Showing> {
  const db = getDb()
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (
      key !== "id" &&
      key !== "created_at" &&
      key !== "object" &&
      key !== "client" &&
      key !== "admin" &&
      value !== undefined
    ) {
      if (key === "scheduled_date") {
        fields.push(`${key} = ?`)
        values.push(value instanceof Date ? value.toISOString() : value)
      } else {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    }
  })

  fields.push("updated_at = CURRENT_TIMESTAMP")
  values.push(id)

  const stmt = db.prepare(`UPDATE showings SET ${fields.join(", ")} WHERE id = ?`)
  stmt.run(...values)

  const showings = await getShowings()
  return showings.find((s) => s.id === id)!
}

export async function deleteShowing(id: number): Promise<void> {
  const db = getDb()
  const stmt = db.prepare("DELETE FROM showings WHERE id = ?")
  stmt.run(id)
}

// Transaction helpers
export async function getTransactions(): Promise<Transaction[]> {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM transactions ORDER BY transaction_date DESC")
  const rows = stmt.all() as any[]

  return rows.map((row) => ({
    ...row,
    transaction_date: new Date(row.transaction_date),
    created_at: new Date(row.created_at),
  }))
}

export async function createTransaction(transaction: Omit<Transaction, "id" | "created_at">): Promise<Transaction> {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO transactions (type, amount, description, client_id, object_id, admin_id, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    transaction.type,
    transaction.amount,
    transaction.description || null,
    transaction.client_id || null,
    transaction.object_id || null,
    transaction.admin_id || null,
    transaction.transaction_date.toISOString(),
  )

  const id = Number(result.lastInsertRowid)
  const transactions = await getTransactions()
  return transactions.find((t) => t.id === id)!
}
