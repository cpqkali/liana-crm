"use client"

import { useState } from "react"
import { ClientList } from "@/components/client-list"
import { ClientFilters } from "@/components/client-filters"
import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon } from "lucide-react"
import Link from "next/link"
import { exportClientsToCSV } from "@/lib/export"
import { toast } from "sonner"

export default function ClientsPage() {
  const [filters, setFilters] = useState({
    search: "",
    waiting_for_showing: "all",
    is_hidden: "false",
    call_status: "all",
  })

  const handleExport = async () => {
    try {
      const response = await fetch("/api/clients")
      const clients = await response.json()
      exportClientsToCSV(clients)
      toast.success("Клиенты успешно экспортированы")
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast.error("Ошибка при экспорте")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Клиенты</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление базой клиентов: контакты, статус звонков и примечания
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <DownloadIcon className="size-4 mr-2" />
            Экспорт CSV
          </Button>
          <Link href="/clients/new">
            <Button>
              <PlusIcon className="size-4 mr-2" />
              Добавить клиента
            </Button>
          </Link>
        </div>
      </div>

      <ClientFilters filters={filters} onFiltersChange={setFilters} />
      <ClientList filters={filters} />
    </div>
  )
}
