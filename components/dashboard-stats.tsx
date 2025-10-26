"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BuildingIcon, UsersIcon, CalendarIcon, TrendingUpIcon } from "lucide-react"
import type { Property, Client, Showing } from "@/lib/db"

interface DashboardStatsProps {
  properties: Property[]
  clients: Client[]
  showings: Showing[]
}

export function DashboardStats({ properties, clients, showings }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    totalClients: 0,
    activeClients: 0,
    totalShowings: 0,
    upcomingShowings: 0,
    totalRevenue: 0,
    averagePrice: 0,
  })

  useEffect(() => {
    const availableCount = properties.filter((p) => p.status === "available").length
    const soldCount = properties.filter((p) => p.status === "sold").length
    const activeClientsCount = clients.filter((c) => c.status === "active").length
    const today = new Date().toISOString().split("T")[0]
    const upcomingCount = showings.filter((s) => s.date >= today).length
    const totalRevenue = properties.filter((p) => p.status === "sold").reduce((sum, p) => sum + p.price, 0)
    const avgPrice = properties.length > 0 ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length : 0

    setStats({
      totalProperties: properties.length,
      availableProperties: availableCount,
      totalClients: clients.length,
      activeClients: activeClientsCount,
      totalShowings: showings.length,
      upcomingShowings: upcomingCount,
      totalRevenue,
      averagePrice: avgPrice,
    })
  }, [properties, clients, showings])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего объектов</CardTitle>
          <BuildingIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProperties}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.availableProperties} свободных
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.activeClients} активных
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Показы</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalShowings}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.upcomingShowings} предстоящих
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Средняя цена</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(stats.averagePrice)}</div>
          <p className="text-xs text-muted-foreground mt-1">Всего продано: {formatPrice(stats.totalRevenue)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
