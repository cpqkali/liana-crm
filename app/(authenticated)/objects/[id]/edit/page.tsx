"use client"

import { PropertyForm } from "@/components/property-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { use } from "react"

export default function EditObjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // In real app, fetch property data by ID
  const mockProperty = {
    id,
    address: "ул. Ленина, д. 45, кв. 12",
    type: "apartment",
    status: "available",
    price: "5500000",
    area: "65",
    rooms: "2",
    floor: "5",
    totalFloors: "9",
    owner: "Иванов И.И.",
    ownerPhone: "+7 (999) 123-45-67",
    description: "Уютная двухкомнатная квартира в центре города",
    inventory: "Холодильник, стиральная машина, кондиционер, встроенный шкаф",
    hasFurniture: true,
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
        <h1 className="text-2xl font-semibold tracking-tight">Редактировать объект {id}</h1>
        <p className="text-sm text-muted-foreground mt-1">Обновите информацию об объекте</p>
      </div>

      <PropertyForm initialData={mockProperty} />
    </div>
  )
}
