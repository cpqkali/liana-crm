"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ClientFormProps {
  initialData?: {
    id?: string
    name?: string
    phone?: string
    callStatus?: string
    type?: string
    status?: string
    budget?: string
    notes?: string
  }
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    callStatus: initialData?.callStatus || "not_called",
    type: initialData?.type || "buyer",
    status: initialData?.status || "active",
    budget: initialData?.budget || "",
    notes: initialData?.notes || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name?.trim() || !formData.phone?.trim()) {
        toast.error("Заполните все обязательные поля")
        setIsSubmitting(false)
        return
      }

      const url = initialData?.id ? `/api/clients/${initialData.id}` : "/api/clients"

      const response = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          callStatus: formData.callStatus,
          type: formData.type,
          status: formData.status,
          budget: formData.budget.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(initialData?.id ? "Клиент успешно обновлен" : "Клиент успешно создан")
        router.push("/clients")
        router.refresh()
      } else {
        toast.error(data.error || "Ошибка при сохранении клиента")
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
      toast.error("Ошибка подключения к серверу")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">
              ФИО <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Іванов Іван Іванович"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">
              Телефон <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+380 (99) 123-45-67"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Тип клиента</Label>
              <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Покупатель</SelectItem>
                  <SelectItem value="seller">Продавец</SelectItem>
                  <SelectItem value="both">Оба</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="callStatus">Статус звонка</Label>
            <Select value={formData.callStatus} onValueChange={(value) => updateField("callStatus", value)}>
              <SelectTrigger id="callStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_called">Не звонили</SelectItem>
                <SelectItem value="reached">Дозвонились</SelectItem>
                <SelectItem value="not_reached">Не дозвонились</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="budget">Бюджет</Label>
            <Input
              id="budget"
              placeholder="1 000 000 - 2 000 000 ₴"
              value={formData.budget}
              onChange={(e) => updateField("budget", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              placeholder="Дополнительная информация о клиенте..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/clients")} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение..." : initialData?.id ? "Сохранить изменения" : "Создать клиента"}
        </Button>
      </div>
    </form>
  )
}
