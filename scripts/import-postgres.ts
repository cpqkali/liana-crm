import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  const exportPath = path.join(__dirname, "..", "data-export.json")

  if (!fs.existsSync(exportPath)) {
    console.error("❌ data-export.json not found. Please run export-sqlite.js first.")
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"))

  console.log("Starting data import to PostgreSQL...")

  // Import users
  console.log(`\nImporting ${data.users.length} users...`)
  for (const user of data.users) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          username: user.username,
          password: user.password,
          role: user.role || "admin",
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt || user.createdAt),
        },
      })
      console.log(`  ✓ User: ${user.username}`)
    } catch (error) {
      console.error(`  ✗ Failed to import user ${user.username}:`, error.message)
    }
  }

  // Import objects
  console.log(`\nImporting ${data.objects.length} objects...`)
  for (const obj of data.objects) {
    try {
      await prisma.object.upsert({
        where: { id: obj.id },
        update: {},
        create: {
          id: obj.id,
          address: obj.address,
          type: obj.type,
          status: obj.status,
          price: obj.price,
          area: obj.area,
          rooms: obj.rooms,
          floor: obj.floor,
          totalFloors: obj.totalFloors,
          owner: obj.owner,
          ownerPhone: obj.ownerPhone,
          ownerEmail: obj.ownerEmail,
          description: obj.description,
          inventory: obj.inventory,
          hasFurniture: obj.hasFurniture === 1 || obj.hasFurniture === true,
          photos: obj.photos,
          district: obj.district,
          notes: obj.notes,
          tags: obj.tags,
          createdAt: new Date(obj.createdAt),
          updatedAt: new Date(obj.updatedAt || obj.createdAt),
        },
      })
      console.log(`  ✓ Object: ${obj.id} - ${obj.address}`)
    } catch (error) {
      console.error(`  ✗ Failed to import object ${obj.id}:`, error.message)
    }
  }

  // Import showings
  console.log(`\nImporting ${data.showings.length} showings...`)
  for (const showing of data.showings) {
    try {
      await prisma.showing.upsert({
        where: { id: showing.id },
        update: {},
        create: {
          id: showing.id,
          objectId: showing.objectId,
          date: showing.date,
          time: showing.time,
          notes: showing.notes,
          createdAt: new Date(showing.createdAt),
        },
      })
      console.log(`  ✓ Showing: ${showing.id}`)
    } catch (error) {
      console.error(`  ✗ Failed to import showing ${showing.id}:`, error.message)
    }
  }

  // Import clients
  console.log(`\nImporting ${data.clients.length} clients...`)
  for (const client of data.clients) {
    try {
      await prisma.client.upsert({
        where: { id: client.id },
        update: {},
        create: {
          id: client.id,
          name: client.name,
          phone: client.phone,
          callStatus: client.callStatus || "not_called",
          type: client.type,
          status: client.status,
          budget: client.budget,
          notes: client.notes,
          createdAt: new Date(client.createdAt),
          updatedAt: new Date(client.updatedAt || client.createdAt),
        },
      })
      console.log(`  ✓ Client: ${client.name}`)
    } catch (error) {
      console.error(`  ✗ Failed to import client ${client.id}:`, error.message)
    }
  }

  console.log("\n✅ Import completed successfully!")
}

main()
  .catch((error) => {
    console.error("❌ Import failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
