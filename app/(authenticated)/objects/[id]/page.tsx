"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftIcon, PencilIcon, TrashIcon, ImageIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { ShowingsTab } from "@/components/showings-tab"
import { toast } from "sonner"
import { deleteObject } from "@/lib/api"
import type { Property, Showing } from "@/lib/db"

const TYPE_LABELS: Record<string, string> = {
  apartment: "Квартира",
  house: "Дом",
}

const STATUS_LABELS: Record<string, string> = {
  available: "Доступен",
  reserved: "Зарезервирован",
  sold: "Продан",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  available: "default",
  reserved: "secondary",
  sold: "outline",
}

export default function ObjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [property, setProperty] = useState<Property | null>(null)
  const [showings, setShowings] = useState<Showing[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)

  useEffect(() => {
    loadProperty()
    loadShowings()
  }, [id])

  const loadProperty = async () => {
    try {
      const response = await fetch(`/api/objects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
        setPhotos(data.photos || [])
      } else {
        toast.error("Объект не найден")
        router.push("/objects")
      }
    } catch (error) {
      console.error("[v0] Load property error:", error)
      toast.error("Ошибка загрузки объекта")
    } finally {
      setLoading(false)
    }
  }

  const loadShowings = async () => {
    try {
      const response = await fetch(`/api/objects/${id}/showings`)
      if (response.ok) {
        const data = await response.json()
        setShowings(data)
      }
    } catch (error) {
      console.error("[v0] Load showings error:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="p-8 text-center">Загрузка...</Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="p-8 text-center">Объект не найден</Card>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePhotoClick = (index: number) => {
    setGalleryStartIndex(index)
    setIsGalleryOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот объект?")) return

    setIsDeleting(true)
    try {
      await deleteObject(id)
      toast.success("Объект успешно удален")
      router.push("/objects")
    } catch (error) {
      toast.error("Ошибка при удалении объекта")
      setIsDeleting(false)
    }
  }

  const handlePreviousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  const handleGalleryPrevious = () => {
    setGalleryStartIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleGalleryNext = () => {
    setGalleryStartIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/objects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeftIcon />
            Назад к списку
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold tracking-tight">{property.address}</h1>
              <Badge variant={STATUS_VARIANTS[property.status]}>{STATUS_LABELS[property.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">ID: {property.id}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/objects/${id}/edit`}>
              <Button variant="outline" size="sm">
                <PencilIcon />
                Редактировать
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <TrashIcon />
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="photos">Фотографии</TabsTrigger>
          <TabsTrigger value="showings">Показы</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Тип объекта</dt>
                  <dd className="font-medium">{TYPE_LABELS[property.type]}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Цена</dt>
                  <dd className="font-medium text-lg">{formatPrice(property.price)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Площадь</dt>
                  <dd className="font-medium">{property.area} м²</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Количество комнат</dt>
                  <dd className="font-medium">{property.rooms || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Этаж</dt>
                  <dd className="font-medium">
                    {property.floor && property.totalFloors ? `${property.floor} из ${property.totalFloors}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Статус</dt>
                  <dd>
                    <Badge variant={STATUS_VARIANTS[property.status]}>{STATUS_LABELS[property.status]}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Мебель</dt>
                  <dd className="font-medium">{property.hasFurniture ? "Есть" : "Нет"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.inventory && (
            <Card>
              <CardHeader>
                <CardTitle>Перечень (что есть в квартире)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{property.inventory}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Информация о владельце</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">ФИО</dt>
                  <dd className="font-medium">{property.owner}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Телефон</dt>
                  <dd className="font-medium">
                    <a href={`tel:${property.ownerPhone}`} className="hover:underline">
                      {property.ownerPhone}
                    </a>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Системная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Дата создания</dt>
                  <dd className="text-sm">{formatDate(property.createdAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Фотогалерея</CardTitle>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Фотографии не загружены</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={photos[currentPhotoIndex] || "/placeholder.svg"}
                      alt={`Фото ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {photos.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                          onClick={handlePreviousPhoto}
                        >
                          <ChevronLeftIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                          onClick={handleNextPhoto}
                        >
                          <ChevronRightIcon />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                          {currentPhotoIndex + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </div>

                  {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                            index === currentPhotoIndex
                              ? "border-primary scale-105"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Миниатюра ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="showings">
          <ShowingsTab objectId={id} initialShowings={showings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
