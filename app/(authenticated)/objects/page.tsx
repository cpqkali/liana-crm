"use client"

import { useState } from "react"
import { PropertyList } from "@/components/property-list"
import { PropertyFilters } from "@/components/property-filters"
import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon } from "lucide-react"
import Link from "next/link"
import { exportPropertiesToCSV } from "@/lib/export"
import { toast } from "sonner"

export default function ObjectsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    rooms: "all",
    district: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  })
  const [viewMode, setViewMode] = useState<"standard" | "large">("standard")

  const handleExport = async () => {
    try {
      const response = await fetch("/api/objects")
      const properties = await response.json()
      exportPropertiesToCSV(properties)
      toast.success("Объекты успешно экспортированы")
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast.error("Ошибка при экспорте")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Объекты недвижимости</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление квартирами: добавление, редактирование и контакты владельцев
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <DownloadIcon className="size-4 mr-2" />
            Экспорт CSV
          </Button>
          <Link href="/objects/new">
            <Button>
              <PlusIcon className="size-4 mr-2" />
              Добавить объект
            </Button>
          </Link>
        </div>
      </div>

      <PropertyFilters
        filters={filters}
        viewMode={viewMode}
        onFiltersChange={setFilters}
        onViewModeChange={setViewMode}
      />
      <PropertyList filters={filters} viewMode={viewMode} />
    </div>
  )
}
