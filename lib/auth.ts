import crypto from "crypto"

export interface AuthToken {
  username: string
  timestamp: number
}

export function createAuthToken(username: string): string {
  const timestamp = Date.now()
  const secret = process.env.AUTH_SECRET || "default-secret-change-in-production"

  // Create HMAC signature
  const data = `${username}:${timestamp}`
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex")

  // Return token as base64 encoded JSON
  const token = Buffer.from(JSON.stringify({ username, timestamp, signature })).toString("base64")
  return token
}

export function verifyAuthToken(token: string): AuthToken | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const { username, timestamp, signature } = JSON.parse(decoded)

    if (!username || !timestamp || !signature) {
      return null
    }

    const secret = process.env.AUTH_SECRET || "default-secret-change-in-production"
    const data = `${username}:${timestamp}`
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex")

    if (signature !== expectedSignature) {
      return null
    }

    // Token expires after 24 hours
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

export function getAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export function setAuthTokenInStorage(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("authToken", token)
}

export function removeAuthTokenFromStorage(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("authToken")
  localStorage.removeItem("username")
  localStorage.removeItem("adminName")
  localStorage.removeItem("adminId")
}
