// Edge-compatible auth utilities for middleware
// Uses Web Crypto API instead of Node.js crypto

export interface AuthToken {
  username: string
  timestamp: number
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)

  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", key, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function base64Decode(str: string): string {
  try {
    // Use atob for base64 decoding in Edge runtime
    return atob(str)
  } catch {
    return ""
  }
}

export async function verifyAuthTokenFormat(token: string): Promise<AuthToken | null> {
  try {
    const decoded = base64Decode(token)
    if (!decoded) return null

    const parsed = JSON.parse(decoded)
    const { username, timestamp, signature } = parsed

    if (!username || !timestamp || !signature) {
      return null
    }

    const secret = process.env.AUTH_SECRET || "default-secret-change-in-production"
    const data = `${username}:${timestamp}`
    const expectedSignature = await hmacSha256(secret, data)

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
