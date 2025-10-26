import "server-only"
import Database from "better-sqlite3"
import { join } from "path"

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_PATH) {
  console.warn("WARNING: DATABASE_PATH not set. Using default path. Data may be lost on redeploy!")
}

let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), "database.sqlite")
    console.log(`[DB] Using database at: ${dbPath}`)
    db = new Database(dbPath)

    // Enable WAL mode for better concurrent access
    db.pragma("journal_mode = WAL")

    // Initialize database schema
    initializeSchema()
  }
  return db
}

function initializeSchema() {
  const db = getDb()

  // Create admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      birth_date DATE,
      additional_phones TEXT,
      notes TEXT,
      call_status TEXT DEFAULT 'not_called' CHECK(call_status IN ('called', 'not_called')),
      call_notes TEXT,
      is_hidden INTEGER DEFAULT 0,
      waiting_for_showing INTEGER DEFAULT 0,
      date_added DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create objects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS objects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      district TEXT,
      rooms INTEGER NOT NULL,
      area REAL NOT NULL,
      floor INTEGER,
      total_floors INTEGER,
      price INTEGER NOT NULL,
      description TEXT,
      owner_id INTEGER,
      buyer_id INTEGER,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'sold', 'has_candidates')),
      photos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (buyer_id) REFERENCES clients(id) ON DELETE SET NULL
    )
  `)

  // Create showings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS showings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      object_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      admin_id INTEGER,
      scheduled_date DATETIME NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    )
  `)

  // Create transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL,
      description TEXT,
      client_id INTEGER,
      object_id INTEGER,
      admin_id INTEGER,
      transaction_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE SET NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    )
  `)

  // Create indexes for better performance on CRM tables
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_crm_clients_call_status ON clients(call_status);
    CREATE INDEX IF NOT EXISTS idx_crm_properties_status ON objects(status);
    CREATE INDEX IF NOT EXISTS idx_crm_showings_date ON showings(scheduled_date);
  `)

  // Insert default admin users if they don't exist
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number }
  if (adminCount.count === 0) {
    const insertAdmin = db.prepare("INSERT INTO admins (username, password, name) VALUES (?, ?, ?)")
    insertAdmin.run("admin", "admin123", "Администратор")
    insertAdmin.run("Elena", "12345", "Елена")
    insertAdmin.run("Anna", "09876", "Анна")
  }
}

// Helper function to format price
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн`
  }
  return price.toLocaleString("ru-RU")
}

// Types
export interface Admin {
  id: number
  username: string
  name: string
  created_at: Date
}

export interface Client {
  id: number
  name: string
  phone: string
  birth_date?: Date
  additional_phones?: string[]
  notes?: string
  call_status: "called" | "not_called"
  call_notes?: string
  is_hidden: boolean
  waiting_for_showing: boolean
  date_added: Date
  created_at: Date
  updated_at: Date
}

export interface PropertyObject {
  id: number
  address: string
  district?: string
  rooms: number
  area: number
  floor?: number
  total_floors?: number
  price: number
  description?: string
  owner_id?: number
  buyer_id?: number
  status: "available" | "sold" | "has_candidates"
  photos?: string[]
  created_at: Date
  updated_at: Date
  owner?: Client
  buyer?: Client
}

export interface Showing {
  id: number
  object_id: number
  client_id: number
  admin_id?: number
  scheduled_date: Date
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  created_at: Date
  updated_at: Date
  object?: PropertyObject
  client?: Client
  admin?: Admin
}

export interface Transaction {
  id: number
  type: "income" | "expense"
  amount: number
  description?: string
  client_id?: number
  object_id?: number
  admin_id?: number
  transaction_date: Date
  created_at: Date
}
