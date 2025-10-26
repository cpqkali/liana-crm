import type { Property, Client, Showing } from "@/lib/db"

export function exportToCSV(data: any[], filename: string, columns: string[]) {
  const headers = columns.join(",")
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col]
        if (value === null || value === undefined) return ""
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(","),
  )

  const csv = [headers, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportPropertiesToCSV(properties: Property[]) {
  const columns = [
    "id",
    "address",
    "type",
    "status",
    "price",
    "area",
    "rooms",
    "floor",
    "totalFloors",
    "district",
    "owner",
    "ownerPhone",
    "description",
  ]
  exportToCSV(properties, "objects", columns)
}

export function exportClientsToCSV(clients: Client[]) {
  const columns = ["id", "name", "phone", "type", "status", "budget", "notes"]
  exportToCSV(clients, "clients", columns)
}

export function exportShowingsToCSV(showings: Showing[]) {
  const columns = ["id", "objectId", "date", "time", "notes"]
  exportToCSV(showings, "showings", columns)
}
