"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchIcon, LayoutGridIcon, LayoutListIcon, XIcon } from "lucide-react"

interface PropertyFiltersProps {
  filters: {
    search: string
    status: string
    rooms: string
    district: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
  }
  viewMode: "standard" | "large"
  onFiltersChange: (filters: any) => void
  onViewModeChange: (mode: "standard" | "large") => void
}

export function PropertyFilters({ filters, viewMode, onFiltersChange, onViewModeChange }: PropertyFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.rooms !== "all" ||
    filters.district ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.maxArea

  const resetFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      rooms: "all",
      district: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search" className="text-xs text-muted-foreground mb-2 block">
              Поиск (ID, Адрес)
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Поиск..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-xs text-muted-foreground mb-2 block">
              Статус
            </Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="available">Свободна</SelectItem>
                <SelectItem value="reserved">Зарезервирована</SelectItem>
                <SelectItem value="sold">Продана</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rooms" className="text-xs text-muted-foreground mb-2 block">
              Комнаты
            </Label>
            <Select value={filters.rooms} onValueChange={(value) => updateFilter("rooms", value)}>
              <SelectTrigger id="rooms">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="district" className="text-xs text-muted-foreground mb-2 block">
              Район
            </Label>
            <Input
              id="district"
              placeholder="Район..."
              value={filters.district}
              onChange={(e) => updateFilter("district", e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full bg-transparent"
            >
              <XIcon className="size-4 mr-2" />
              Сбросить
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div>
            <Label htmlFor="minPrice" className="text-xs text-muted-foreground mb-2 block">
              Цена от (₴)
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Минимум"
              value={filters.minPrice || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maxPrice" className="text-xs text-muted-foreground mb-2 block">
              Цена до (₴)
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Максимум"
              value={filters.maxPrice || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="minArea" className="text-xs text-muted-foreground mb-2 block">
              Площадь от (м²)
            </Label>
            <Input
              id="minArea"
              type="number"
              placeholder="Минимум"
              value={filters.minArea || ""}
              onChange={(e) => updateFilter("minArea", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maxArea" className="text-xs text-muted-foreground mb-2 block">
              Площадь до (м²)
            </Label>
            <Input
              id="maxArea"
              type="number"
              placeholder="Максимум"
              value={filters.maxArea || ""}
              onChange={(e) => updateFilter("maxArea", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant={viewMode === "standard" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("standard")}
          >
            <LayoutListIcon className="size-4 mr-2" />
            Таблица
          </Button>
          <Button
            variant={viewMode === "large" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("large")}
          >
            <LayoutGridIcon className="size-4 mr-2" />
            Карточки
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
