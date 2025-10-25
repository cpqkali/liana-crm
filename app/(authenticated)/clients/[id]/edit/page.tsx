"use client"

import { ClientForm } from "@/components/client-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { use } from "react"

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // In real app, fetch client data by ID
  const mockClient = {
    id,
    name: "Иванов Иван Иванович",
    phone: "+7 (999) 123-45-67",
    email: "ivanov@example.com",
    type: "buyer",
    status: "active",
    budget: "5000000-7000000",
    notes: "Ищет квартиру в центре города, 2-3 комнаты",
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
        <h1 className="text-2xl font-semibold tracking-tight">Редактировать клиента {id}</h1>
        <p className="text-sm text-muted-foreground mt-1">Обновите информацию о клиенте</p>
      </div>

      <ClientForm initialData={mockClient} />
    </div>
  )
}
