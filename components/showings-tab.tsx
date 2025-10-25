"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { createShowing, updateShowing, deleteShowing } from "@/lib/api"

interface Showing {
  id: string
  date: string
  time: string
  notes?: string
}

interface ShowingsTabProps {
  objectId: string
  initialShowings?: Showing[]
}

export function ShowingsTab({ objectId, initialShowings = [] }: ShowingsTabProps) {
  const [showings, setShowings] = useState<Showing[]>(initialShowings)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShowing, setEditingShowing] = useState<Showing | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFormData({ date: "", time: "", notes: "" })
    setEditingShowing(null)
  }

  const handleOpenDialog = (showing?: Showing) => {
    if (showing) {
      setEditingShowing(showing)
      setFormData({
        date: showing.date,
        time: showing.time,
        notes: showing.notes || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.date?.trim() || !formData.time?.trim()) {
        toast.error("Заполните все обязательные поля")
        setIsSubmitting(false)
        return
      }

      if (editingShowing) {
        await updateShowing(objectId, editingShowing.id, formData)
        setShowings(showings.map((s) => (s.id === editingShowing.id ? { ...s, ...formData } : s)))
        toast.success("Показ обновлен")
      } else {
        const result = await createShowing(objectId, formData)
        setShowings([...showings, { id: result.id, ...formData }])
        toast.success("Показ добавлен")
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Ошибка при сохранении показа")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (showingId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот показ?")) return

    try {
      await deleteShowing(objectId, showingId)
      setShowings(showings.filter((s) => s.id !== showingId))
      toast.success("Показ удален")
    } catch (error) {
      toast.error("Ошибка при удалении показа")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Показы квартиры</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <PlusIcon />
                Добавить показ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingShowing ? "Редактировать показ" : "Добавить показ"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                  <Label htmlFor="notes">Заметки</Label>
                  <Textarea
                    id="notes"
                    placeholder="Дополнительная информация о показе..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Сохранение..." : editingShowing ? "Сохранить" : "Добавить"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {showings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Показы не запланированы</p>
            <p className="text-sm mt-1">Добавьте первый показ, нажав кнопку выше</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Заметки</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showings.map((showing) => (
                <TableRow key={showing.id}>
                  <TableCell className="font-medium">{formatDate(showing.date)}</TableCell>
                  <TableCell>{showing.time}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{showing.notes || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleOpenDialog(showing)}>
                        <PencilIcon />
                        <span className="sr-only">Редактировать</span>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(showing.id)}>
                        <TrashIcon />
                        <span className="sr-only">Удалить</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
