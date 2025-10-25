"use client"

import { ClientForm } from "@/components/client-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function NewClientPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeftIcon />
            Назад к списку
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Добавить клиента</h1>
        <p className="text-sm text-muted-foreground mt-1">Заполните информацию о новом клиенте</p>
      </div>

      <ClientForm />
    </div>
  )
}
