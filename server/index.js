import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import sqlite3 from "sqlite3"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8000
const JWT_SECRET = process.env.JWT_SECRET || "liana-secret-key-change-in-production"

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const databasesDir = path.join(__dirname, "databases")
if (!fs.existsSync(databasesDir)) {
  fs.mkdirSync(databasesDir, { recursive: true })
}

// Database setup with better error handling
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err)
    process.exit(1)
  } else {
    console.log("Connected to SQLite database")
    initDatabase()
  }
})

// Promisify database operations for modern async/await
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve(this)
    })
  })
}

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

const getObjectDb = (objectId) => {
  const dbPath = path.join(databasesDir, `object_${objectId}.db`)
  return new sqlite3.Database(dbPath)
}

const objectDbRun = (objectDb, sql, params = []) => {
  return new Promise((resolve, reject) => {
    objectDb.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve(this)
    })
  })
}

const objectDbGet = (objectDb, sql, params = []) => {
  return new Promise((resolve, reject) => {
    objectDb.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

const objectDbAll = (objectDb, sql, params = []) => {
  return new Promise((resolve, reject) => {
    objectDb.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

async function initObjectDatabase(objectId, objectData) {
  const objectDb = getObjectDb(objectId)

  try {
    await objectDbRun(
      objectDb,
      `
      CREATE TABLE IF NOT EXISTS object_info (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        price INTEGER NOT NULL,
        area REAL NOT NULL,
        rooms INTEGER,
        floor INTEGER,
        totalFloors INTEGER,
        owner TEXT,
        ownerPhone TEXT,
        ownerEmail TEXT,
        description TEXT,
        inventory TEXT,
        hasFurniture INTEGER DEFAULT 0,
        district TEXT,
        notes TEXT,
        tags TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    )

    await objectDbRun(
      objectDb,
      `
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        photoPath TEXT NOT NULL,
        uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    )

    await objectDbRun(
      objectDb,
      `
      CREATE TABLE IF NOT EXISTS showings (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    )

    await objectDbRun(
      objectDb,
      `
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    )

    // Insert or update object info
    const existingObject = await objectDbGet(objectDb, "SELECT id FROM object_info WHERE id = ?", [objectId])

    if (!existingObject) {
      await objectDbRun(
        objectDb,
        `
        INSERT INTO object_info (id, address, type, status, price, area, rooms, floor, totalFloors, owner, ownerPhone, ownerEmail, description, inventory, hasFurniture, district, notes, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          objectData.id,
          objectData.address,
          objectData.type,
          objectData.status,
          objectData.price,
          objectData.area,
          objectData.rooms || null,
          objectData.floor || null,
          objectData.totalFloors || null,
          objectData.owner || null,
          objectData.ownerPhone || null,
          objectData.ownerEmail || null,
          objectData.description || null,
          objectData.inventory || null,
          objectData.hasFurniture ? 1 : 0,
          objectData.district || null,
          objectData.notes || null,
          objectData.tags || null,
        ],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["created", `Object ${objectId} created`],
      )
    }

    console.log(`Object database initialized for ${objectId}`)
  } catch (err) {
    console.error(`Error initializing object database for ${objectId}:`, err)
  } finally {
    objectDb.close()
  }
}

// Initialize database tables
async function initDatabase() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'user')),
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await dbRun(`
      CREATE TABLE IF NOT EXISTS objects (
        id TEXT PRIMARY KEY CHECK(length(id) = 5 AND id GLOB '[0-9][0-9][0-9][0-9][0-9]'),
        address TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('apartment', 'house')),
        status TEXT NOT NULL,
        price INTEGER NOT NULL,
        area REAL NOT NULL,
        rooms INTEGER,
        floor INTEGER,
        totalFloors INTEGER,
        owner TEXT,
        ownerPhone TEXT,
        ownerEmail TEXT,
        description TEXT,
        inventory TEXT,
        hasFurniture INTEGER DEFAULT 0,
        photos TEXT,
        district TEXT,
        notes TEXT,
        tags TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await dbRun(`
      CREATE TABLE IF NOT EXISTS showings (
        id TEXT PRIMARY KEY,
        objectId TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (objectId) REFERENCES objects(id) ON DELETE CASCADE
      )
    `)

    await dbRun(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        callStatus TEXT DEFAULT 'not_called' CHECK(callStatus IN ('not_called', 'reached', 'not_reached')),
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        budget TEXT,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await initializeDefaultUsers()
  } catch (err) {
    console.error("Error initializing database:", err)
  }
}

async function initializeDefaultUsers() {
  const defaultUsers = [
    { username: "Elena", password: "12345", role: "admin" },
    { username: "Anna", password: "09876", role: "admin" },
  ]

  for (const user of defaultUsers) {
    try {
      const existingUser = await dbGet("SELECT * FROM users WHERE username = ?", [user.username])

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10)
        const userId = "USR-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)

        await dbRun("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)", [
          userId,
          user.username,
          hashedPassword,
          user.role,
        ])
        console.log(`Default admin user ${user.username} created`)
      }
    } catch (err) {
      console.error(`Error creating user ${user.username}:`, err)
    }
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("[v0] JWT verification error:", err.message)
      return res.status(401).json({ error: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" })
    }

    const user = await dbGet("SELECT * FROM users WHERE username = ?", [username])

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    res.json({ token, username: user.username, role: user.role })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.put("/api/auth/update-profile", authenticateToken, async (req, res) => {
  try {
    const { currentUsername, newUsername, currentPassword, newPassword } = req.body

    if (!currentUsername || !newUsername || !currentPassword) {
      return res.status(400).json({ error: "Required fields missing" })
    }

    const user = await dbGet("SELECT * FROM users WHERE username = ?", [currentUsername])

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    let updateQuery = "UPDATE users SET username = ?, updatedAt = CURRENT_TIMESTAMP"
    const params = [newUsername]

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateQuery += ", password = ?"
      params.push(hashedPassword)
    }

    updateQuery += " WHERE id = ?"
    params.push(user.id)

    await dbRun(updateQuery, params)

    const token = jwt.sign({ id: user.id, username: newUsername, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    res.json({ message: "Profile updated successfully", token, username: newUsername })
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Username already exists" })
    }
    console.error("Update profile error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Configure multer for file uploads
const upload = multer({ dest: uploadsDir })

// Objects routes
app.get("/api/objects", async (req, res) => {
  try {
    const rows = await dbAll("SELECT * FROM objects ORDER BY createdAt DESC")
    res.json(rows)
  } catch (err) {
    console.error("Get objects error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/objects/:id", async (req, res) => {
  try {
    const { id } = req.params
    const row = await dbGet("SELECT * FROM objects WHERE id = ?", [id])

    if (!row) {
      return res.status(404).json({ error: "Object not found" })
    }
    res.json(row)
  } catch (err) {
    console.error("Get object error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/objects", async (req, res) => {
  try {
    const {
      id,
      address,
      type,
      status,
      price,
      area,
      rooms,
      floor,
      totalFloors,
      owner,
      ownerPhone,
      ownerEmail,
      description,
      inventory,
      hasFurniture,
      district,
      notes,
      tags,
    } = req.body

    if (!id || !address || !type || !status || !price || !area) {
      return res.status(400).json({ error: "Required fields missing" })
    }

    if (status !== "available" && (!owner || !ownerPhone)) {
      return res.status(400).json({ error: "Owner information required for non-available objects" })
    }

    await dbRun(
      `INSERT INTO objects (id, address, type, status, price, area, rooms, floor, totalFloors, owner, ownerPhone, ownerEmail, description, inventory, hasFurniture, photos, district, notes, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        address,
        type,
        status,
        price,
        area,
        rooms || null,
        floor || null,
        totalFloors || null,
        owner || null,
        ownerPhone || null,
        ownerEmail || null,
        description || null,
        inventory || null,
        hasFurniture ? 1 : 0,
        "[]",
        district || null,
        notes || null,
        tags ? JSON.stringify(tags) : null,
      ],
    )

    await initObjectDatabase(id, {
      id,
      address,
      type,
      status,
      price,
      area,
      rooms,
      floor,
      totalFloors,
      owner,
      ownerPhone,
      ownerEmail,
      description,
      inventory,
      hasFurniture,
      district,
      notes,
      tags: tags ? JSON.stringify(tags) : null,
    })

    res.json({ id, message: "Object created successfully" })
  } catch (err) {
    if (err.message.includes("UNIQUE") || err.message.includes("constraint")) {
      return res.status(400).json({ error: "Object with this ID already exists" })
    }
    console.error("Create object error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.put("/api/objects/:id", async (req, res) => {
  try {
    const { id } = req.params
    const {
      address,
      type,
      status,
      price,
      area,
      rooms,
      floor,
      totalFloors,
      owner,
      ownerPhone,
      ownerEmail,
      description,
      inventory,
      hasFurniture,
      district,
      notes,
      tags,
    } = req.body

    await dbRun(
      `UPDATE objects SET address = ?, type = ?, status = ?, price = ?, area = ?, rooms = ?, floor = ?, totalFloors = ?, 
       owner = ?, ownerPhone = ?, ownerEmail = ?, description = ?, inventory = ?, hasFurniture = ?, district = ?, notes = ?, tags = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        address,
        type,
        status,
        price,
        area,
        rooms || null,
        floor || null,
        totalFloors || null,
        owner || null,
        ownerPhone || null,
        ownerEmail || null,
        description || null,
        inventory || null,
        hasFurniture ? 1 : 0,
        district || null,
        notes || null,
        tags ? JSON.stringify(tags) : null,
        id,
      ],
    )

    const objectDb = getObjectDb(id)
    try {
      await objectDbRun(
        objectDb,
        `
        UPDATE object_info SET address = ?, type = ?, status = ?, price = ?, area = ?, rooms = ?, floor = ?, totalFloors = ?,
        owner = ?, ownerPhone = ?, ownerEmail = ?, description = ?, inventory = ?, hasFurniture = ?, district = ?, notes = ?, tags = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [
          address,
          type,
          status,
          price,
          area,
          rooms || null,
          floor || null,
          totalFloors || null,
          owner || null,
          ownerPhone || null,
          ownerEmail || null,
          description || null,
          inventory || null,
          hasFurniture ? 1 : 0,
          district || null,
          notes || null,
          tags ? JSON.stringify(tags) : null,
          id,
        ],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["updated", `Object ${id} updated`],
      )
    } finally {
      objectDb.close()
    }

    res.json({ message: "Object updated successfully" })
  } catch (err) {
    console.error("Update object error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.delete("/api/objects/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Get photos to delete files
    const row = await dbGet("SELECT photos FROM objects WHERE id = ?", [id])

    // Delete photo files
    if (row?.photos) {
      try {
        const photos = JSON.parse(row.photos)
        photos.forEach((photoPath) => {
          const filePath = path.join(__dirname, photoPath)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        })
      } catch (e) {
        console.error("Error deleting photos:", e)
      }
    }

    // Delete object from database
    await dbRun("DELETE FROM objects WHERE id = ?", [id])

    const objectDbPath = path.join(databasesDir, `object_${id}.db`)
    if (fs.existsSync(objectDbPath)) {
      fs.unlinkSync(objectDbPath)
    }

    res.json({ message: "Object deleted successfully" })
  } catch (err) {
    console.error("Delete object error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Photo routes
app.post("/api/objects/:id/photos", upload.single("photo"), async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const photoPath = `/uploads/${req.file.filename}`

    // Get current photos
    const row = await dbGet("SELECT photos FROM objects WHERE id = ?", [id])

    let photos = []
    if (row?.photos) {
      try {
        photos = JSON.parse(row.photos)
      } catch (e) {
        photos = []
      }
    }

    photos.push(photoPath)

    // Update photos in database
    await dbRun("UPDATE objects SET photos = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [
      JSON.stringify(photos),
      id,
    ])

    const objectDb = getObjectDb(id)
    try {
      await objectDbRun(
        objectDb,
        `
        INSERT INTO photos (photoPath) VALUES (?)
      `,
        [photoPath],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["photo_added", `Photo added: ${photoPath}`],
      )
    } finally {
      objectDb.close()
    }

    res.json({ photoPath, message: "Photo uploaded successfully" })
  } catch (err) {
    console.error("Upload photo error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.delete("/api/objects/:id/photos", async (req, res) => {
  try {
    const { id } = req.params
    const { photoPath } = req.body

    // Get current photos
    const row = await dbGet("SELECT photos FROM objects WHERE id = ?", [id])

    let photos = []
    if (row?.photos) {
      try {
        photos = JSON.parse(row.photos)
      } catch (e) {
        photos = []
      }
    }

    // Remove photo from array
    photos = photos.filter((p) => p !== photoPath)

    // Delete file from filesystem
    const filePath = path.join(__dirname, photoPath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Update photos in database
    await dbRun("UPDATE objects SET photos = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [
      JSON.stringify(photos),
      id,
    ])

    const objectDb = getObjectDb(id)
    try {
      await objectDbRun(
        objectDb,
        `
        DELETE FROM photos WHERE photoPath = ?
      `,
        [photoPath],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["photo_deleted", `Photo deleted: ${photoPath}`],
      )
    } finally {
      objectDb.close()
    }

    res.json({ message: "Photo deleted successfully" })
  } catch (err) {
    console.error("Delete photo error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Showings routes
app.get("/api/showings", async (req, res) => {
  try {
    const rows = await dbAll("SELECT * FROM showings ORDER BY date, time")
    res.json(rows)
  } catch (err) {
    console.error("Get showings error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/objects/:id/showings", async (req, res) => {
  try {
    const { id } = req.params
    const rows = await dbAll("SELECT * FROM showings WHERE objectId = ? ORDER BY date, time", [id])
    res.json(rows)
  } catch (err) {
    console.error("Get object showings error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/objects/:id/showings", async (req, res) => {
  try {
    const { id } = req.params
    const { date, time, notes } = req.body
    const showingId = "SHW-" + Date.now()

    await dbRun("INSERT INTO showings (id, objectId, date, time, notes) VALUES (?, ?, ?, ?, ?)", [
      showingId,
      id,
      date,
      time,
      notes || null,
    ])

    const objectDb = getObjectDb(id)
    try {
      await objectDbRun(
        objectDb,
        `
        INSERT INTO showings (id, date, time, notes) VALUES (?, ?, ?, ?)
      `,
        [showingId, date, time, notes || null],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["showing_created", `Showing ${showingId} created for ${date} at ${time}`],
      )
    } finally {
      objectDb.close()
    }

    res.json({ id: showingId, message: "Showing created successfully" })
  } catch (err) {
    console.error("Create showing error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.put("/api/objects/:id/showings/:showingId", async (req, res) => {
  try {
    const { id, showingId } = req.params
    const { date, time, notes } = req.body

    await dbRun("UPDATE showings SET date = ?, time = ?, notes = ? WHERE id = ?", [
      date,
      time,
      notes || null,
      showingId,
    ])

    const objectDb = getObjectDb(id)
    try {
      await objectDbRun(
        objectDb,
        `
        UPDATE showings SET date = ?, time = ?, notes = ? WHERE id = ?
      `,
        [date, time, notes || null, showingId],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["showing_updated", `Showing ${showingId} updated`],
      )
    } finally {
      objectDb.close()
    }

    res.json({ message: "Showing updated successfully" })
  } catch (err) {
    console.error("Update showing error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.delete("/api/objects/:id/showings/:showingId", async (req, res) => {
  try {
    const { id, showingId } = req.params
    await dbRun("DELETE FROM showings WHERE id = ?", [showingId])

    const objectDb = getObjectDb(id)
    try {
      await objectDbRun(
        objectDb,
        `
        DELETE FROM showings WHERE id = ?
      `,
        [showingId],
      )

      await objectDbRun(
        objectDb,
        `
        INSERT INTO history (action, details) VALUES (?, ?)
      `,
        ["showing_deleted", `Showing ${showingId} deleted`],
      )
    } finally {
      objectDb.close()
    }

    res.json({ message: "Showing deleted successfully" })
  } catch (err) {
    console.error("Delete showing error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Clients routes
app.get("/api/clients", async (req, res) => {
  try {
    const rows = await dbAll("SELECT * FROM clients ORDER BY createdAt DESC")
    res.json(rows)
  } catch (err) {
    console.error("Get clients error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params
    const row = await dbGet("SELECT * FROM clients WHERE id = ?", [id])

    if (!row) {
      return res.status(404).json({ error: "Client not found" })
    }
    res.json(row)
  } catch (err) {
    console.error("Get client error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/clients", async (req, res) => {
  try {
    const { name, phone, callStatus, type, status, budget, notes } = req.body

    if (!name || !phone || !type || !status) {
      return res.status(400).json({ error: "Required fields missing" })
    }

    const clientId = "CLI-" + Date.now()

    await dbRun(
      "INSERT INTO clients (id, name, phone, callStatus, type, status, budget, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [clientId, name, phone, callStatus || "not_called", type, status, budget || null, notes || null],
    )

    res.json({ id: clientId, message: "Client created successfully" })
  } catch (err) {
    console.error("Create client error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.put("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, callStatus, type, status, budget, notes } = req.body

    await dbRun(
      "UPDATE clients SET name = ?, phone = ?, callStatus = ?, type = ?, status = ?, budget = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [name, phone, callStatus, type, status, budget || null, notes || null, id],
    )

    res.json({ message: "Client updated successfully" })
  } catch (err) {
    console.error("Update client error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.delete("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params
    await dbRun("DELETE FROM clients WHERE id = ?", [id])
    res.json({ message: "Client deleted successfully" })
  } catch (err) {
    console.error("Delete client error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on("SIGINT", async () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err)
    } else {
      console.log("Database connection closed")
    }
    process.exit(0)
  })
})
