"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AdminAction } from "@/lib/db"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AdminHistoryPage() {
  const router = useRouter()
  const [adminUsernames, setAdminUsernames] = useState<string[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<string>("all")
  const [actions, setActions] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch admin usernames
      const usernamesResponse = await fetch("/api/admin-actions/usernames")
      if (usernamesResponse.ok) {
        const { usernames } = await usernamesResponse.json()
        setAdminUsernames(usernames)
      }

      // Fetch actions
      const url =
        selectedAdmin === "all"
          ? "/api/admin-actions"
          : `/api/admin-actions?username=${encodeURIComponent(selectedAdmin)}`

      const actionsResponse = await fetch(url)
      if (actionsResponse.ok) {
        const { actions: allActions } = await actionsResponse.json()

        // Sort by timestamp descending (newest first)
        allActions.sort(
          (a: AdminAction, b: AdminAction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        setActions(allActions)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getActionColor = (action: string) => {
    if (action.includes("Вход")) return "default"
    if (action.includes("Создан") || action.includes("Добавлен")) return "default"
    if (action.includes("Обновлен") || action.includes("Изменен")) return "secondary"
    if (action.includes("Удален")) return "destructive"
    return "outline"
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
          <ArrowLeftIcon className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">История действий администраторов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Просмотр всех действий, выполненных администраторами в системе
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтр</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="admin-select">Выберите администратора</Label>
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger id="admin-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все администраторы</SelectItem>
                {adminUsernames.map((username) => (
                  <SelectItem key={username} value={username}>
                    {username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История действий {selectedAdmin !== "all" && `- ${selectedAdmin}`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Загрузка...</p>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>История действий пуста</p>
              <p className="text-sm mt-1">Действия администраторов будут отображаться здесь</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getActionColor(action.action)}>{action.action}</Badge>
                          <span className="text-sm font-medium">{action.adminUsername}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>IP: {action.ipAddress}</span>
                      <span>•</span>
                      <span>{formatDate(action.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
