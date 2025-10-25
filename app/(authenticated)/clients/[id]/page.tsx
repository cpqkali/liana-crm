"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { toast } from "sonner"
import { deleteClient } from "@/lib/api"

const TYPE_LABELS: Record<string, string> = {
  buyer: "Покупатель",
  seller: "Продавец",
  both: "Покупатель и продавец",
}

const STATUS_LABELS: Record<string, string> = {
  active: "Активный",
  inactive: "Неактивный",
  completed: "Сделка завершена",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  completed: "outline",
}

const CALL_STATUS_LABELS: Record<string, string> = {
  not_called: "Еще не звонили",
  reached: "Дозвонились",
  not_reached: "Не дозвонились",
}

const CALL_STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  not_called: "outline",
  reached: "default",
  not_reached: "secondary",
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  // Mock data - in real app this would come from API/database
  const client = {
    id,
    name: "Іванов Іван Іванович",
    phone: "+380 (99) 123-45-67",
    callStatus: "reached",
    type: "buyer",
    status: "active",
    budget: "1500000-2100000",
    notes: "Ищет квартиру в центре города, 2-3 комнаты. Готов к просмотрам в будние дни после 18:00.",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-16",
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого клиента?")) return

    setIsDeleting(true)
    try {
      await deleteClient(id)
      toast.success("Клиент успешно удален")
      router.push("/clients")
    } catch (error) {
      toast.error("Ошибка при удалении клиента")
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeftIcon />
            Назад к списку
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
              <Badge variant={STATUS_VARIANTS[client.status]}>{STATUS_LABELS[client.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">ID: {client.id}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/clients/${id}/edit`}>
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground mb-1">ФИО</dt>
                <dd className="font-medium">{client.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Тип клиента</dt>
                <dd className="font-medium">{TYPE_LABELS[client.type]}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Телефон</dt>
                <dd className="font-medium">
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Статус звонка</dt>
                <dd>
                  <Badge variant={CALL_STATUS_VARIANTS[client.callStatus]}>
                    {CALL_STATUS_LABELS[client.callStatus]}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Статус</dt>
                <dd>
                  <Badge variant={STATUS_VARIANTS[client.status]}>{STATUS_LABELS[client.status]}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Бюджет</dt>
                <dd className="font-medium">{client.budget || "Не указан"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заметки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{client.notes}</p>
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
                <dd className="text-sm">{formatDate(client.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Последнее обновление</dt>
                <dd className="text-sm">{formatDate(client.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
