"use client"

import type React from "react"
import { PropertyNotes } from "@/components/property-notes"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PlusIcon, XIcon, ImageIcon, TrashIcon } from "lucide-react"
import type { Client } from "@/lib/data-store"

interface PropertyFormProps {
  initialData?: {
    id?: string
    address?: string
    type?: string
    status?: string
    price?: number
    area?: number
    rooms?: number
    floor?: number
    totalFloors?: number
    owner?: string
    ownerPhone?: string
    description?: string
    hasFurniture?: boolean
    inventory?: string
    district?: string
    photos?: string[]
    notes?: string
    tags?: string[]
  }
}

export function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    address: initialData?.address || "",
    type: initialData?.type || "apartment",
    status: initialData?.status || "available",
    price: initialData?.price ? initialData.price.toString() : "",
    area: initialData?.area ? initialData.area.toString() : "",
    rooms: initialData?.rooms ? initialData.rooms.toString() : "",
    floor: initialData?.floor ? initialData.floor.toString() : "",
    totalFloors: initialData?.totalFloors ? initialData.totalFloors.toString() : "",
    owner: initialData?.owner || "",
    ownerPhone: initialData?.ownerPhone || "",
    description: initialData?.description || "",
    hasFurniture: initialData?.hasFurniture || false,
    inventory: initialData?.inventory || "",
    district: initialData?.district || "",
  })

  const [inventoryItems, setInventoryItems] = useState<string[]>([])
  const [newInventoryItem, setNewInventoryItem] = useState("")
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])

  useEffect(() => {
    if (formData.inventory) {
      const items = formData.inventory
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
      setInventoryItems(items)
    }
  }, [])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (error) {
        console.error("[v0] Failed to load clients:", error)
      } finally {
        setLoadingClients(false)
      }
    }
    loadClients()
  }, [])

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addInventoryItem = () => {
    if (newInventoryItem.trim()) {
      setInventoryItems((prev) => [...prev, newInventoryItem.trim()])
      setNewInventoryItem("")
    }
  }

  const removeInventoryItem = (index: number) => {
    setInventoryItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleOwnerSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id === clientId)
    if (selectedClient) {
      setFormData((prev) => ({
        ...prev,
        owner: selectedClient.name,
        ownerPhone: selectedClient.phone,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.id?.trim()) {
        toast.error("Заполните ID объекта")
        setIsSubmitting(false)
        return
      }

      if (!formData.address?.trim()) {
        toast.error("Заполните адрес")
        setIsSubmitting(false)
        return
      }

      if (!formData.price?.trim() || Number(formData.price) <= 0) {
        toast.error("Заполните корректную цену")
        setIsSubmitting(false)
        return
      }

      if (!formData.area?.trim() || Number(formData.area) <= 0) {
        toast.error("Заполните корректную площадь")
        setIsSubmitting(false)
        return
      }

      if (formData.status !== "available") {
        if (!formData.owner?.trim()) {
          toast.error("Заполните ФИО собственника")
          setIsSubmitting(false)
          return
        }

        if (!formData.ownerPhone?.trim()) {
          toast.error("Заполните телефон собственника")
          setIsSubmitting(false)
          return
        }
      }

      const url = initialData?.id ? `/api/objects/${initialData.id}` : "/api/objects"

      const inventoryString = inventoryItems.join(", ")

      const response = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id.trim(),
          address: formData.address.trim(),
          type: formData.type,
          status: formData.status,
          price: Number(formData.price),
          area: Number(formData.area),
          rooms: formData.rooms ? Number(formData.rooms) : undefined,
          floor: formData.floor ? Number(formData.floor) : undefined,
          totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
          owner: formData.status !== "available" ? formData.owner.trim() : undefined,
          ownerPhone: formData.status !== "available" ? formData.ownerPhone.trim() : undefined,
          description: formData.description.trim() || undefined,
          hasFurniture: formData.hasFurniture,
          inventory: inventoryString || undefined,
          district: formData.district.trim() || undefined,
          photos: photos.length > 0 ? photos : undefined,
          notes: notes.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(initialData?.id ? "Объект успешно обновлен" : "Объект успешно создан")
        router.push("/objects")
        router.refresh()
      } else {
        toast.error(data.error || "Ошибка при сохранении объекта")
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
            <Label htmlFor="id">
              ID объекта <span className="text-destructive">*</span>
            </Label>
            <Input
              id="id"
              placeholder="10001"
              value={formData.id}
              onChange={(e) => updateField("id", e.target.value)}
              required
              disabled={!!initialData?.id}
            />
            <p className="text-xs text-muted-foreground mt-1">5-значный номер объекта</p>
          </div>

          <div>
            <Label htmlFor="address">
              Адрес <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="вул. Соборна, буд. 45, кв. 12, Миколаїв"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="district">Район</Label>
            <Input
              id="district"
              placeholder="Центральный"
              value={formData.district}
              onChange={(e) => updateField("district", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">
                Тип <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Квартира</SelectItem>
                  <SelectItem value="house">Дом</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">
                Статус <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Доступна</SelectItem>
                  <SelectItem value="reserved">Зарезервирована</SelectItem>
                  <SelectItem value="sold">Продана</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">"Доступна" - клиентов на квартиру пока нет</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">
                Цена (₴) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="1650000"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="area">
                Площадь (м²) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder="65"
                value={formData.area}
                onChange={(e) => updateField("area", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="rooms">Количество комнат</Label>
              <Input
                id="rooms"
                type="number"
                placeholder="2"
                value={formData.rooms}
                onChange={(e) => updateField("rooms", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floor">Этаж</Label>
              <Input
                id="floor"
                type="number"
                placeholder="5"
                value={formData.floor}
                onChange={(e) => updateField("floor", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalFloors">Всего этажей</Label>
              <Input
                id="totalFloors"
                type="number"
                placeholder="9"
                value={formData.totalFloors}
                onChange={(e) => updateField("totalFloors", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Уютная двухкомнатная квартира в центре города..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Фотографии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Загрузить фотографии</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Добавьте фотографии объекта. Можно загрузить несколько изображений.
            </p>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label htmlFor="photo-upload">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Нажмите для загрузки фотографий</p>
              </div>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Мебель и комплектация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hasFurniture"
              checked={formData.hasFurniture}
              onCheckedChange={(checked) => updateField("hasFurniture", checked)}
            />
            <Label htmlFor="hasFurniture" className="cursor-pointer">
              {formData.hasFurniture ? "Есть мебель" : "Нету мебели"}
            </Label>
          </div>

          <div>
            <Label>Что есть в квартире</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Добавьте предметы мебели, технику и другие элементы комплектации
            </p>

            {inventoryItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
                {inventoryItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeInventoryItem(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Например: Холодильник, Стиральная машина, Кондиционер..."
                value={newInventoryItem}
                onChange={(e) => setNewInventoryItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addInventoryItem()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addInventoryItem}>
                <PlusIcon className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {formData.status !== "available" && (
        <Card>
          <CardHeader>
            <CardTitle>Собственник</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loadingClients && clients.length > 0 && (
              <div>
                <Label htmlFor="clientSelect">Выбрать из существующих клиентов</Label>
                <Select onValueChange={handleOwnerSelect}>
                  <SelectTrigger id="clientSelect">
                    <SelectValue placeholder="Выберите клиента..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">или заполните данные вручную ниже</p>
              </div>
            )}

            <div>
              <Label htmlFor="owner">
                ФИО собственника <span className="text-destructive">*</span>
              </Label>
              <Input
                id="owner"
                placeholder="Іванов І.І."
                value={formData.owner}
                onChange={(e) => updateField("owner", e.target.value)}
                required={formData.status !== "available"}
              />
            </div>

            <div>
              <Label htmlFor="ownerPhone">
                Телефон собственника <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ownerPhone"
                type="tel"
                placeholder="+380 (99) 123-45-67"
                value={formData.ownerPhone}
                onChange={(e) => updateField("ownerPhone", e.target.value)}
                required={formData.status !== "available"}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <PropertyNotes notes={notes} tags={tags} onNotesChange={setNotes} onTagsChange={setTags} />

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/objects")} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение..." : initialData?.id ? "Сохранить изменения" : "Создать объект"}
        </Button>
      </div>
    </form>
  )
}
