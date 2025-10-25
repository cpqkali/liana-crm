"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BellIcon, XIcon } from "lucide-react"
import type { Showing, Property } from "@/lib/data-store"

interface NotificationsPanelProps {
  showings: Showing[]
  properties: Property[]
}

export function NotificationsPanel({ showings, properties }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])

  useEffect(() => {
    generateNotifications()
  }, [showings, properties])

  const generateNotifications = () => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const newNotifications: any[] = []

    // Уведомления о показах сегодня
    const todayShowings = showings.filter((s) => s.date === today)
    if (todayShowings.length > 0) {
      newNotifications.push({
        id: `today-${todayShowings.length}`,
        type: "today-showings",
        title: `Сегодня ${todayShowings.length} показов`,
        description: `Не забудьте о ${todayShowings.length} запланированных показах`,
        severity: "info",
      })
    }

    // Уведомления о показах завтра
    const tomorrowShowings = showings.filter((s) => s.date === tomorrow)
    if (tomorrowShowings.length > 0) {
      newNotifications.push({
        id: `tomorrow-${tomorrowShowings.length}`,
        type: "tomorrow-showings",
        title: `Завтра ${tomorrowShowings.length} показов`,
        description: `Подготовьтесь к ${tomorrowShowings.length} показам завтра`,
        severity: "warning",
      })
    }

    // Уведомления о свободных объектах
    const availableCount = properties.filter((p) => p.status === "available").length
    if (availableCount > 0) {
      newNotifications.push({
        id: "available-properties",
        type: "available-properties",
        title: `${availableCount} свободных объектов`,
        description: `Есть ${availableCount} объектов, готовых к показу`,
        severity: "info",
      })
    }

    setNotifications(newNotifications.filter((n) => !dismissedNotifications.includes(n.id)))
  }

  const dismissNotification = (id: string) => {
    setDismissedNotifications([...dismissedNotifications, id])
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border-l-4 ${notification.severity === "warning" ? "border-l-yellow-500" : "border-l-blue-500"}`}
        >
          <CardContent className="pt-4 pb-4 flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <BellIcon className="size-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
              className="flex-shrink-0"
            >
              <XIcon className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
