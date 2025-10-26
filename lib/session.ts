import { cookies } from "next/headers"
import { verifyAuthToken } from "./auth"

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("authToken")?.value

  if (!token) {
    return null
  }

  const tokenData = verifyAuthToken(token)
  if (!tokenData) {
    return null
  }

  return {
    username: tokenData.username,
    token,
  }
}

export async function requireSession() {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return session
}
