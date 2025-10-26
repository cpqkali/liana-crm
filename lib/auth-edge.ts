import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "liana-secret-key-change-in-production"

export interface JWTPayload {
  id: number
  username: string
}

export async function verifyAuthTokenFormat(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      id: payload.id as number,
      username: payload.username as string,
    }
  } catch (error) {
    return null
  }
}
