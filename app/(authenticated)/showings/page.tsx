"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarIcon, Clock, Trash2, Edit, Plus } from "lucide-react"
import { toast } from "sonner"
import { ShowingsCalendar } from "@/components/showings-calendar"

interface Showing {
  id: string
  objectId: string
  objectAddress?: string
  date: string
  time: string
  notes?: string
}

export default function ShowingsPage() {
  const [showings, setShowings] = useState<Showing[]>([])
  const [objects, setObjects] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShowing, setEditingShowing] = useState<Showing | null>(null)
  const [formData, setFormData] = useState({
    objectId: "",
    date: "",
    time: "",
    notes: "",
  })

  useEffect(() => {
    loadShowings()
    loadObjects()
  }, [])

  const loadShowings = async () => {
    try {
      const response = await fetch("/api/showings")
      if (response.ok) {
        const data = await response.json()
        setShowings(data)
      }
    } catch (error) {
      console.error("Error loading showings:", error)
      toast.error("Не удалось загрузить показы. Проверьте подключение к серверу.")
    }
  }

  const loadObjects = async () => {
    try {
      const response = await fetch("/api/objects")
      if (response.ok) {
        const data = await response.json()
        setObjects(data)
      }
    } catch (error) {
      console.error("Error loading objects:", error)
      toast.error("Не удалось загрузить объекты. Проверьте подключение к серверу.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.objectId?.trim() || !formData.date?.trim() || !formData.time?.trim()) {
      toast.error("Заполните все обязательные поля")
      return
    }

    try {
      if (editingShowing) {
        const response = await fetch(`/api/objects/${formData.objectId}/showings/${editingShowing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success("Показ обновлен")
          loadShowings()
        } else {
          toast.error("Ошибка при обновлении показа")
        }
      } else {
        const response = await fetch(`/api/objects/${formData.objectId}/showings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success("Показ создан")
          loadShowings()
        } else {
          toast.error("Ошибка при создании показа")
        }
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Ошибка при сохранении показа. Проверьте подключение к серверу.")
    }
  }

  const handleDelete = async (showing: Showing) => {
    if (!confirm("Вы уверены, что хотите удалить этот показ?")) return

    try {
      const response = await fetch(`/api/objects/${showing.objectId}/showings/${showing.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Показ удален")
        loadShowings()
      } else {
        toast.error("Ошибка при удалении показа")
      }
    } catch (error) {
      toast.error("Ошибка при удалении показа. Проверьте подключение к серверу.")
    }
  }

  const handleEdit = (showing: Showing) => {
    setEditingShowing(showing)
    setFormData({
      objectId: showing.objectId,
      date: showing.date,
      time: showing.time,
      notes: showing.notes || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingShowing(null)
    setFormData({
      objectId: "",
      date: "",
      time: "",
      notes: "",
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const getObjectAddress = (objectId: string) => {
    const object = objects.find((obj) => obj.id === objectId)
    return object?.address || "Адрес не найден"
  }

  const sortedShowings = [...showings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Показы недвижимости</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Планирование и управление показами объектов: дата, время и заметки для каждой встречи
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить показ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingShowing ? "Редактировать показ" : "Новый показ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="objectId">
                  Объект <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.objectId}
                  onValueChange={(value) => setFormData({ ...formData, objectId: value })}
                  required
                >
                  <SelectTrigger id="objectId">
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {objects.map((obj) => (
                      <SelectItem key={obj.id} value={obj.id}>
                        {obj.id} - {obj.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
                    Дата <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">
                    Время <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Дополнительная информация о показе..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Отмена
                </Button>
                <Button type="submit">{editingShowing ? "Сохранить" : "Создать"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <ShowingsCalendar showings={showings} properties={objects} />
      </div>

      {sortedShowings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет запланированных показов</h3>
            <p className="text-sm text-muted-foreground mb-1 text-center max-w-md">
              Создайте первый показ, чтобы организовать встречу клиента с объектом недвижимости
            </p>
            <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
              Вы сможете выбрать объект, указать дату и время, а также добавить заметки
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить показ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedShowings.map((showing) => (
            <Card key={showing.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{getObjectAddress(showing.objectId)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">ID: {showing.objectId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(showing)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(showing)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(showing.date).toLocaleDateString("ru-RU")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{showing.time}</span>
                  </div>
                </div>
                {showing.notes && <p className="text-sm text-muted-foreground mt-3 border-t pt-3">{showing.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
