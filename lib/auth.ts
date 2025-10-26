import crypto from "crypto"
import { getDb } from "./db"
import "server-only"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("FATAL ERROR: AUTH_SECRET environment variable must be set in production!")
}

export interface AuthToken {
  username: string
  timestamp: number
}

export interface Session {
  id: string
  username: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export function createAuthToken(username: string): string {
  const timestamp = Date.now()
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured")
  }

  // Create HMAC signature
  const data = `${username}:${timestamp}`
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex")

  // Return token as base64 encoded JSON
  const token = Buffer.from(JSON.stringify({ username, timestamp, signature })).toString("base64")

  // Store session in database
  const db = getDb()
  const sessionId = crypto.randomBytes(16).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Create sessions table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_sessions (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Clean up expired sessions
  db.prepare("DELETE FROM crm_sessions WHERE expires_at < datetime('now')").run()

  // Insert new session
  const stmt = db.prepare("INSERT INTO crm_sessions (id, username, token, expires_at) VALUES (?, ?, ?, ?)")
  stmt.run(sessionId, username, token, expiresAt.toISOString())

  return token
}

export function verifyAuthToken(token: string): AuthToken | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const { username, timestamp, signature } = JSON.parse(decoded)

    if (!username || !timestamp || !signature) {
      return null
    }

    const secret = process.env.AUTH_SECRET

    if (!secret) {
      throw new Error("AUTH_SECRET is not configured")
    }

    const data = `${username}:${timestamp}`
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex")

    if (signature !== expectedSignature) {
      return null
    }

    // Check if session exists in database
    const db = getDb()
    const stmt = db.prepare("SELECT * FROM crm_sessions WHERE token = ? AND expires_at > datetime('now')")
    const session = stmt.get(token) as any

    if (!session) {
      return null
    }

    // Token expires after 24 hours
    const tokenAge = Date.now() - Number(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (tokenAge > maxAge) {
      // Delete expired session
      db.prepare("DELETE FROM crm_sessions WHERE token = ?").run(token)
      return null
    }

    return {
      username,
      timestamp: Number(timestamp),
    }
  } catch (error) {
    return null
  }
}

export function deleteAuthToken(token: string): void {
  try {
    const db = getDb()
    db.prepare("DELETE FROM crm_sessions WHERE token = ?").run(token)
  } catch (error) {
    // Ignore errors
  }
}

export function getUsernameFromToken(token: string): string | null {
  const tokenData = verifyAuthToken(token)
  return tokenData ? tokenData.username : null
}

export function verifyAuthTokenFormat(token: string): AuthToken | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const { username, timestamp, signature } = JSON.parse(decoded)

    if (!username || !timestamp || !signature) {
      return null
    }

    const secret = process.env.AUTH_SECRET

    if (!secret) {
      throw new Error("AUTH_SECRET is not configured")
    }

    const data = `${username}:${timestamp}`
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex")

    if (signature !== expectedSignature) {
      return null
    }

    // Check token age without database
    const tokenAge = Date.now() - Number(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (tokenAge > maxAge) {
      return null
    }

    return {
      username,
      timestamp: Number(timestamp),
    }
  } catch (error) {
    return null
  }
}

export async function verifyAuth(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return { authenticated: false, user: null }
  }

  const tokenData = verifyAuthToken(token)
  if (!tokenData) {
    return { authenticated: false, user: null }
  }

  return {
    authenticated: true,
    user: {
      username: tokenData.username,
    },
  }
}
