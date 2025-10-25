"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Calendar, FileText, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { NotificationsPanel } from "@/components/notifications-panel"
import type { Property, Client, Showing } from "@/lib/data-store"

export default function HomePage() {
  const [stats, setStats] = useState({
    objects: 0,
    clients: 0,
    showings: 0,
    soldObjects: 0,
  })
  const [data, setData] = useState<{
    properties: Property[]
    clients: Client[]
    showings: Showing[]
  }>({
    properties: [],
    clients: [],
    showings: [],
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [objectsRes, clientsRes, showingsRes] = await Promise.all([
        fetch("/api/objects"),
        fetch("/api/clients"),
        fetch("/api/showings"),
      ])

      const [objects, clients, showings] = await Promise.all([
        objectsRes.ok ? objectsRes.json() : [],
        clientsRes.ok ? clientsRes.json() : [],
        showingsRes.ok ? showingsRes.json() : [],
      ])

      setData({
        properties: objects,
        clients,
        showings,
      })

      setStats({
        objects: objects.length,
        clients: clients.length,
        showings: showings.length,
        soldObjects: objects.filter((o: any) => o.status === "sold").length,
      })
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    }
  }

  const handleGenerateReport = async () => {
    try {
      toast.info("Генерация отчета...")
      const response = await fetch("/api/reports/generate")

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `liana-report-${new Date().toISOString().split("T")[0]}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Отчет успешно сгенерирован")
      } else {
        toast.error("Ошибка генерации отчета")
      }
    } catch (error) {
      console.error("[v0] Generate report error:", error)
      toast.error("Ошибка генерации отчета")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Добро пожаловать в Liana</h1>
        <p className="text-muted-foreground mt-2">
          Профессиональная система управления недвижимостью для эффективной работы с объектами, клиентами и показами
        </p>
      </div>

      <div className="mb-6">
        <NotificationsPanel showings={data.showings} properties={data.properties} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Объекты недвижимости</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.objects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.objects === 0 ? "Начните с добавления первого объекта" : "Активных объектов в базе данных"}
            </p>
            <Link href="/objects">
              <Button variant="link" className="px-0 mt-3 h-auto">
                Перейти к объектам →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">База клиентов</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.clients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.clients === 0 ? "Добавьте первого клиента" : "Клиентов в вашей базе"}
            </p>
            <Link href="/clients">
              <Button variant="link" className="px-0 mt-3 h-auto">
                Перейти к клиентам →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Запланированные показы</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.showings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.showings === 0 ? "Запланируйте первый показ" : "Предстоящих показов"}
            </p>
            <Link href="/showings">
              <Button variant="link" className="px-0 mt-3 h-auto">
                Перейти к показам →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сданные объекты</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.soldObjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.soldObjects === 0 ? "Пока нет сданных объектов" : "Успешно завершенных сделок"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Аналитика и отчеты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Выгрузите полный HTML отчет с информацией о доходах, расходах, всех клиентах и объектах недвижимости.
              </p>
              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Сгенерировать отчет
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/objects/new" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Building2 className="mr-2 h-4 w-4" />
                  Добавить объект
                </Button>
              </Link>
              <Link href="/clients/new" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Добавить клиента
                </Button>
              </Link>
              <Link href="/showings" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Запланировать показ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
