"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { SearchIcon } from "lucide-react"

interface ClientFiltersProps {
  filters: {
    search: string
    waiting_for_showing: string
    is_hidden: string
    call_status: string
  }
  onFiltersChange: (filters: any) => void
}

export function ClientFilters({ filters, onFiltersChange }: ClientFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search" className="text-xs text-muted-foreground mb-2 block">
              Поиск (ID, Имя, Телефон)
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
            <Label htmlFor="waiting" className="text-xs text-muted-foreground mb-2 block">
              Ждут показа
            </Label>
            <Select
              value={filters.waiting_for_showing}
              onValueChange={(value) => updateFilter("waiting_for_showing", value)}
            >
              <SelectTrigger id="waiting">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="true">Ждут показа</SelectItem>
                <SelectItem value="false">Не ждут</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="call_status" className="text-xs text-muted-foreground mb-2 block">
              Обзвонить
            </Label>
            <Select value={filters.call_status} onValueChange={(value) => updateFilter("call_status", value)}>
              <SelectTrigger id="call_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="not_called">Не звонили</SelectItem>
                <SelectItem value="called">Дозвонились</SelectItem>
                <SelectItem value="not_reached">Не дозвонились</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hidden" className="text-xs text-muted-foreground mb-2 block">
              Скрытые
            </Label>
            <Select value={filters.is_hidden} onValueChange={(value) => updateFilter("is_hidden", value)}>
              <SelectTrigger id="hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Активные</SelectItem>
                <SelectItem value="true">Скрытые</SelectItem>
                <SelectItem value="all">Все</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
