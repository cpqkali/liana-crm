import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"
import { verifyAuth } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dataStore = getDataStore()
    const usernames = dataStore.getAllAdminUsernames()

    return NextResponse.json({ usernames })
  } catch (error) {
    console.error("Error fetching admin usernames:", error)
    return NextResponse.json({ error: "Failed to fetch admin usernames" }, { status: 500 })
  }
}
