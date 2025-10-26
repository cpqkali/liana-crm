import "server-only"
import crypto from "crypto"
import { getDb } from "./db"

if (process.env.NODE_ENV === "production" && !process.env.PASSWORD_SALT) {
  throw new Error("FATAL ERROR: PASSWORD_SALT environment variable must be set in production!")
}

export interface Property {
  id: string
  address: string
  type: "apartment" | "house"
  status: "available" | "reserved" | "sold"
  price: number
  area: number
  rooms?: number
  floor?: number
  totalFloors?: number
  owner?: string
  ownerPhone?: string
  description?: string
  inventory?: string
  hasFurniture: boolean
  photos?: string[]
  notes?: string
  tags?: string[]
  createdAt: string
}

export interface Client {
  id: string
  name: string
  phone: string
  callStatus: "not_called" | "reached" | "not_reached"
  type: "buyer" | "seller" | "both"
  status: "active" | "inactive" | "completed"
  budget?: string
  notes?: string
  createdAt: string
}

export interface Showing {
  id: string
  objectId: string
  date: string
  time: string
  notes?: string
  createdAt: string
}

export interface User {
  username: string
  password: string
  fullName: string
  email: string
}

export interface AdminAction {
  id: string
  adminUsername: string
  action: string
  details: string
  ipAddress: string
  timestamp: string
}

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT

  if (!salt) {
    throw new Error("PASSWORD_SALT is not configured")
  }

  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Data store class using SQLite
class DataStore {
  constructor() {
    this.initializeDatabase()
  }

  private initializeDatabase() {
    const db = getDb()

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS crm_users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create properties table
    db.exec(`
      CREATE TABLE IF NOT EXISTS crm_properties (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        type TEXT CHECK(type IN ('apartment', 'house')) NOT NULL,
        status TEXT CHECK(status IN ('available', 'reserved', 'sold')) NOT NULL,
        price REAL NOT NULL,
        area REAL NOT NULL,
        rooms INTEGER,
        floor INTEGER,
        total_floors INTEGER,
        owner TEXT,
        owner_phone TEXT,
        description TEXT,
        inventory TEXT,
        has_furniture INTEGER DEFAULT 0,
        photos TEXT,
        notes TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create clients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS crm_clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        call_status TEXT CHECK(call_status IN ('not_called', 'reached', 'not_reached')) DEFAULT 'not_called',
        type TEXT CHECK(type IN ('buyer', 'seller', 'both')) DEFAULT 'buyer',
        status TEXT CHECK(status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
        budget TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create showings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS crm_showings (
        id TEXT PRIMARY KEY,
        object_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (object_id) REFERENCES crm_properties(id) ON DELETE CASCADE
      )
    `)

    // Create admin actions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS crm_admin_actions (
        id TEXT PRIMARY KEY,
        admin_username TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert default users if they don't exist
    const userCount = db.prepare("SELECT COUNT(*) as count FROM crm_users").get() as { count: number }
    if (userCount.count === 0) {
      const insertUser = db.prepare("INSERT INTO crm_users (username, password, full_name, email) VALUES (?, ?, ?, ?)")
      insertUser.run("admin", hashPassword("admin123"), "Администратор", "admin@liana.com")
      insertUser.run("Elena", hashPassword("12345"), "Elena", "elena@liana.com")
      insertUser.run("Anna", hashPassword("09876"), "Anna", "anna@liana.com")
    }
  }

  clearAllData() {
    const db = getDb()
    db.exec("DELETE FROM crm_properties")
    db.exec("DELETE FROM crm_clients")
    db.exec("DELETE FROM crm_showings")
    db.exec("DELETE FROM crm_admin_actions")
  }

  logAdminAction(action: Omit<AdminAction, "id" | "timestamp">) {
    const db = getDb()
    const newAction: AdminAction = {
      ...action,
      id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    const stmt = db.prepare(
      "INSERT INTO crm_admin_actions (id, admin_username, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
    )
    stmt.run(
      newAction.id,
      newAction.adminUsername,
      newAction.action,
      newAction.details,
      newAction.ipAddress,
      newAction.timestamp,
    )

    return newAction
  }

  getAdminActions(username?: string) {
    const db = getDb()
    let query = "SELECT * FROM crm_admin_actions"
    const params: any[] = []

    if (username) {
      query += " WHERE admin_username = ?"
      params.push(username)
    }

    query += " ORDER BY timestamp DESC"

    const stmt = db.prepare(query)
    return stmt.all(...params) as AdminAction[]
  }

  getAllAdminUsernames() {
    const db = getDb()
    const stmt = db.prepare("SELECT DISTINCT admin_username FROM crm_admin_actions")
    const rows = stmt.all() as { admin_username: string }[]
    return rows.map((r) => r.admin_username)
  }

  // Properties
  getProperties() {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_properties ORDER BY created_at DESC")
    const rows = stmt.all() as any[]

    return rows.map((row) => ({
      ...row,
      hasFurniture: Boolean(row.has_furniture),
      totalFloors: row.total_floors,
      ownerPhone: row.owner_phone,
      createdAt: row.created_at,
      photos: row.photos ? JSON.parse(row.photos) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
    })) as Property[]
  }

  getProperty(id: string) {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_properties WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      hasFurniture: Boolean(row.has_furniture),
      totalFloors: row.total_floors,
      ownerPhone: row.owner_phone,
      createdAt: row.created_at,
      photos: row.photos ? JSON.parse(row.photos) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
    } as Property
  }

  createProperty(property: Omit<Property, "createdAt">) {
    const db = getDb()
    const newProperty = {
      ...property,
      createdAt: new Date().toISOString(),
    }

    const stmt = db.prepare(`
      INSERT INTO crm_properties (id, address, type, status, price, area, rooms, floor, total_floors, owner, owner_phone, description, inventory, has_furniture, photos, notes, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      newProperty.id,
      newProperty.address,
      newProperty.type,
      newProperty.status,
      newProperty.price,
      newProperty.area,
      newProperty.rooms || null,
      newProperty.floor || null,
      newProperty.totalFloors || null,
      newProperty.owner || null,
      newProperty.ownerPhone || null,
      newProperty.description || null,
      newProperty.inventory || null,
      newProperty.hasFurniture ? 1 : 0,
      JSON.stringify(newProperty.photos || []),
      newProperty.notes || null,
      JSON.stringify(newProperty.tags || []),
      newProperty.createdAt,
    )

    return newProperty
  }

  updateProperty(id: string, updates: Partial<Property>) {
    const db = getDb()
    const property = this.getProperty(id)
    if (!property) return null

    const updated = { ...property, ...updates }

    const stmt = db.prepare(`
      UPDATE crm_properties 
      SET address = ?, type = ?, status = ?, price = ?, area = ?, rooms = ?, floor = ?, total_floors = ?, 
          owner = ?, owner_phone = ?, description = ?, inventory = ?, has_furniture = ?, photos = ?, notes = ?, tags = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.address,
      updated.type,
      updated.status,
      updated.price,
      updated.area,
      updated.rooms || null,
      updated.floor || null,
      updated.totalFloors || null,
      updated.owner || null,
      updated.ownerPhone || null,
      updated.description || null,
      updated.inventory || null,
      updated.hasFurniture ? 1 : 0,
      JSON.stringify(updated.photos || []),
      updated.notes || null,
      JSON.stringify(updated.tags || []),
      id,
    )

    return this.getProperty(id)
  }

  deleteProperty(id: string) {
    const db = getDb()
    const stmt = db.prepare("DELETE FROM crm_properties WHERE id = ?")
    const result = stmt.run(id)

    // Also delete related showings
    const deleteShowings = db.prepare("DELETE FROM crm_showings WHERE object_id = ?")
    deleteShowings.run(id)

    return result.changes > 0
  }

  // Clients
  getClients() {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_clients ORDER BY created_at DESC")
    const rows = stmt.all() as any[]

    return rows.map((row) => ({
      ...row,
      callStatus: row.call_status,
      createdAt: row.created_at,
    })) as Client[]
  }

  getClient(id: string) {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_clients WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      callStatus: row.call_status,
      createdAt: row.created_at,
    } as Client
  }

  createClient(client: Omit<Client, "id" | "createdAt">) {
    const db = getDb()
    const newClient = {
      ...client,
      id: `CLI-${String(this.getClients().length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    }

    const stmt = db.prepare(`
      INSERT INTO crm_clients (id, name, phone, call_status, type, status, budget, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      newClient.id,
      newClient.name,
      newClient.phone,
      newClient.callStatus,
      newClient.type,
      newClient.status,
      newClient.budget || null,
      newClient.notes || null,
      newClient.createdAt,
    )

    return newClient
  }

  updateClient(id: string, updates: Partial<Client>) {
    const db = getDb()
    const client = this.getClient(id)
    if (!client) return null

    const updated = { ...client, ...updates }

    const stmt = db.prepare(`
      UPDATE crm_clients 
      SET name = ?, phone = ?, call_status = ?, type = ?, status = ?, budget = ?, notes = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.name,
      updated.phone,
      updated.callStatus,
      updated.type,
      updated.status,
      updated.budget || null,
      updated.notes || null,
      id,
    )

    return this.getClient(id)
  }

  deleteClient(id: string) {
    const db = getDb()
    const stmt = db.prepare("DELETE FROM crm_clients WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Showings
  getShowings() {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_showings ORDER BY date DESC, time DESC")
    const rows = stmt.all() as any[]

    return rows.map((row) => ({
      ...row,
      objectId: row.object_id,
      createdAt: row.created_at,
    })) as Showing[]
  }

  getShowing(id: string) {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_showings WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      objectId: row.object_id,
      createdAt: row.created_at,
    } as Showing
  }

  getShowingsByObject(objectId: string) {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_showings WHERE object_id = ? ORDER BY date DESC, time DESC")
    const rows = stmt.all(objectId) as any[]

    return rows.map((row) => ({
      ...row,
      objectId: row.object_id,
      createdAt: row.created_at,
    })) as Showing[]
  }

  createShowing(showing: Omit<Showing, "id" | "createdAt">) {
    const db = getDb()
    const newShowing = {
      ...showing,
      id: `SH-${String(this.getShowings().length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    }

    const stmt = db.prepare(`
      INSERT INTO crm_showings (id, object_id, date, time, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      newShowing.id,
      newShowing.objectId,
      newShowing.date,
      newShowing.time,
      newShowing.notes || null,
      newShowing.createdAt,
    )

    return newShowing
  }

  updateShowing(id: string, updates: Partial<Showing>) {
    const db = getDb()
    const showing = this.getShowing(id)
    if (!showing) return null

    const updated = { ...showing, ...updates }

    const stmt = db.prepare(`
      UPDATE crm_showings 
      SET object_id = ?, date = ?, time = ?, notes = ?
      WHERE id = ?
    `)

    stmt.run(updated.objectId, updated.date, updated.time, updated.notes || null, id)

    return this.getShowing(id)
  }

  deleteShowing(id: string) {
    const db = getDb()
    const stmt = db.prepare("DELETE FROM crm_showings WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Users
  getUser(username: string) {
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_users WHERE username = ?")
    const row = stmt.get(username) as any

    if (!row) return null

    return {
      username: row.username,
      password: row.password,
      fullName: row.full_name,
      email: row.email,
    } as User
  }

  verifyUserPassword(username: string, password: string): boolean {
    const user = this.getUser(username)
    if (!user) return false
    return verifyPassword(password, user.password)
  }

  updateUser(username: string, updates: Partial<User>) {
    const db = getDb()
    const user = this.getUser(username)
    if (!user) return null

    const updated = { ...user, ...updates }

    // Hash password if it's being updated
    if (updates.password) {
      updated.password = hashPassword(updates.password)
    }

    const stmt = db.prepare(`
      UPDATE crm_users 
      SET password = ?, full_name = ?, email = ?
      WHERE username = ?
    `)

    stmt.run(updated.password, updated.fullName, updated.email, username)

    return this.getUser(username)
  }
}

// Singleton instance
let dataStore: DataStore | null = null

export function getDataStore() {
  if (!dataStore) {
    dataStore = new DataStore()
  }
  return dataStore
}
