import jwt from "jsonwebtoken"
import { getDb } from "./db"
import "server-only"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "liana-secret-key-change-in-production"

export interface JWTPayload {
  id: number
  username: string
}

export function createAuthToken(id: number, username: string): string {
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET environment variable must be set in production!")
  }
  return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyAuthToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function getUsernameFromToken(token: string): string | null {
  const tokenData = verifyAuthToken(token)
  return tokenData ? tokenData.username : null
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

export function deleteAuthToken(token: string): void {
  try {
    const db = getDb()
    db.prepare("DELETE FROM crm_sessions WHERE token = ?").run(token)
  } catch (error) {
    // Ignore errors
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
