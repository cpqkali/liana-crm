// Server-side data store with file system persistence
// Data is stored in JSON files on the server

import crypto from "crypto"
import fs from "fs"
import path from "path"

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
  owner: string
  ownerPhone: string
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

const INITIAL_PROPERTIES: Property[] = []
const INITIAL_CLIENTS: Client[] = []
const INITIAL_SHOWINGS: Showing[] = []

function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + (process.env.PASSWORD_SALT || "salt"))
    .digest("hex")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

const INITIAL_USERS: User[] = [
  {
    username: "admin",
    password: hashPassword("admin123"),
    fullName: "Администратор",
    email: "admin@liana.com",
  },
  {
    username: "Elena",
    password: hashPassword("12345"),
    fullName: "Elena",
    email: "elena@liana.com",
  },
  {
    username: "Anna",
    password: hashPassword("09876"),
    fullName: "Anna",
    email: "anna@liana.com",
  },
]

const DATA_DIR = path.join(process.cwd(), "data")
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json")
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json")
const SHOWINGS_FILE = path.join(DATA_DIR, "showings.json")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const ACTIONS_FILE = path.join(DATA_DIR, "admin-actions.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJSONFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`[v0] Error reading ${filePath}:`, error)
  }
  return defaultValue
}

function writeJSONFile<T>(filePath: string, data: T): void {
  try {
    ensureDataDir()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error(`[v0] Error writing ${filePath}:`, error)
  }
}

class DataStore {
  private properties: Property[] = []
  private clients: Client[] = []
  private showings: Showing[] = []
  private users: User[] = []
  private adminActions: AdminAction[] = []

  constructor() {
    this.loadData()
  }

  private loadData() {
    this.properties = readJSONFile(PROPERTIES_FILE, INITIAL_PROPERTIES)
    this.clients = readJSONFile(CLIENTS_FILE, INITIAL_CLIENTS)
    this.showings = readJSONFile(SHOWINGS_FILE, INITIAL_SHOWINGS)
    this.users = readJSONFile(USERS_FILE, INITIAL_USERS)
    this.adminActions = readJSONFile(ACTIONS_FILE, [])

    console.log("[v0] DataStore loaded from files")
    console.log("[v0] Users count:", this.users.length)
    console.log("[v0] Properties count:", this.properties.length)
    console.log("[v0] Clients count:", this.clients.length)
  }

  private saveData() {
    writeJSONFile(PROPERTIES_FILE, this.properties)
    writeJSONFile(CLIENTS_FILE, this.clients)
    writeJSONFile(SHOWINGS_FILE, this.showings)
    writeJSONFile(USERS_FILE, this.users)
    writeJSONFile(ACTIONS_FILE, this.adminActions)
  }

  clearAllData() {
    this.properties = []
    this.clients = []
    this.showings = []
    this.adminActions = []
    this.saveData()
  }

  logAdminAction(action: Omit<AdminAction, "id" | "timestamp">) {
    const newAction: AdminAction = {
      ...action,
      id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    this.adminActions.push(newAction)
    this.saveData()
    return newAction
  }

  getAdminActions(username?: string) {
    if (username) {
      return this.adminActions.filter((a) => a.adminUsername === username)
    }
    return this.adminActions
  }

  getAllAdminUsernames() {
    const usernames = new Set(this.adminActions.map((a) => a.adminUsername))
    return Array.from(usernames)
  }

  // Properties
  getProperties() {
    return this.properties
  }

  getProperty(id: string) {
    return this.properties.find((p) => p.id === id)
  }

  createProperty(property: Omit<Property, "createdAt">) {
    const newProperty = {
      ...property,
      createdAt: new Date().toISOString(),
    }
    this.properties.push(newProperty)
    this.saveData()
    return newProperty
  }

  updateProperty(id: string, updates: Partial<Property>) {
    const index = this.properties.findIndex((p) => p.id === id)
    if (index === -1) return null
    this.properties[index] = { ...this.properties[index], ...updates }
    this.saveData()
    return this.properties[index]
  }

  deleteProperty(id: string) {
    const index = this.properties.findIndex((p) => p.id === id)
    if (index === -1) return false
    this.properties.splice(index, 1)
    // Also delete related showings
    this.showings = this.showings.filter((s) => s.objectId !== id)
    this.saveData()
    return true
  }

  // Clients
  getClients() {
    return this.clients
  }

  getClient(id: string) {
    return this.clients.find((c) => c.id === id)
  }

  createClient(client: Omit<Client, "id" | "createdAt">) {
    const newClient = {
      ...client,
      id: `CLI-${String(this.clients.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    }
    this.clients.push(newClient)
    this.saveData()
    return newClient
  }

  updateClient(id: string, updates: Partial<Client>) {
    const index = this.clients.findIndex((c) => c.id === id)
    if (index === -1) return null
    this.clients[index] = { ...this.clients[index], ...updates }
    this.saveData()
    return this.clients[index]
  }

  deleteClient(id: string) {
    const index = this.clients.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.clients.splice(index, 1)
    this.saveData()
    return true
  }

  // Showings
  getShowings() {
    return this.showings
  }

  getShowing(id: string) {
    return this.showings.find((s) => s.id === id)
  }

  getShowingsByObject(objectId: string) {
    return this.showings.filter((s) => s.objectId === objectId)
  }

  createShowing(showing: Omit<Showing, "id" | "createdAt">) {
    const newShowing = {
      ...showing,
      id: `SH-${String(this.showings.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    }
    this.showings.push(newShowing)
    this.saveData()
    return newShowing
  }

  updateShowing(id: string, updates: Partial<Showing>) {
    const index = this.showings.findIndex((s) => s.id === id)
    if (index === -1) return null
    this.showings[index] = { ...this.showings[index], ...updates }
    this.saveData()
    return this.showings[index]
  }

  deleteShowing(id: string) {
    const index = this.showings.findIndex((s) => s.id === id)
    if (index === -1) return false
    this.showings.splice(index, 1)
    this.saveData()
    return true
  }

  // Users
  getUser(username: string) {
    return this.users.find((u) => u.username === username)
  }

  verifyUserPassword(username: string, password: string): boolean {
    const user = this.getUser(username)
    if (!user) return false
    return verifyPassword(password, user.password)
  }

  updateUser(username: string, updates: Partial<User>) {
    const index = this.users.findIndex((u) => u.username === username)
    if (index === -1) return null
    this.users[index] = { ...this.users[index], ...updates }
    this.saveData()
    return this.users[index]
  }
}

let dataStoreInstance: DataStore | null = null

export function getDataStore(): DataStore {
  if (!dataStoreInstance) {
    dataStoreInstance = new DataStore()
  }
  return dataStoreInstance
}
