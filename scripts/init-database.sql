-- Initialize SQLite database for Liana CRM
-- This script creates all necessary tables and initial data

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  type TEXT CHECK(type IN ('apartment', 'house')) NOT NULL,
  status TEXT CHECK(status IN ('available', 'reserved', 'sold')) NOT NULL,
  price REAL NOT NULL,
  area REAL NOT NULL,
  rooms INTEGER,
  floor INTEGER,
  total_floors INTEGER,
  owner TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  description TEXT,
  inventory TEXT,
  has_furniture BOOLEAN DEFAULT 0,
  photos TEXT, -- JSON array
  notes TEXT,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  call_status TEXT CHECK(call_status IN ('not_called', 'reached', 'not_reached')) DEFAULT 'not_called',
  type TEXT CHECK(type IN ('buyer', 'seller', 'both')) DEFAULT 'buyer',
  status TEXT CHECK(status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  budget TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Showings table
CREATE TABLE IF NOT EXISTS showings (
  id TEXT PRIMARY KEY,
  object_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (object_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Admin actions log table
CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Insert default users with hashed passwords
-- Password hashing will be done by the application
INSERT OR IGNORE INTO users (username, password, full_name, email) VALUES
  ('admin', '', 'Администратор', 'admin@liana.com'),
  ('Elena', '', 'Elena', 'elena@liana.com'),
  ('Anna', '', 'Anna', 'anna@liana.com');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_showings_object ON showings(object_id);
CREATE INDEX IF NOT EXISTS idx_showings_date ON showings(date);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_username ON sessions(username);
CREATE INDEX IF NOT EXISTS idx_admin_actions_username ON admin_actions(admin_username);
