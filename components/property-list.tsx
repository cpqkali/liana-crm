"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { BuildingIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Property } from "@/lib/data-store"

interface PropertyListProps {
  filters: {
    search: string
    status: string
    rooms: string
    district: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
  }
  viewMode: "standard" | "large"
}

export function PropertyList({ filters, viewMode }: PropertyListProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = viewMode === "large" ? 6 : 10

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/objects")
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error("[v0] Load properties error:", error)
      toast.error("Ошибка загрузки объектов")
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter((property) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        property.address.toLowerCase().includes(searchLower) ||
        property.id.toLowerCase().includes(searchLower) ||
        property.district?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filters.status !== "all" && property.status !== filters.status) {
      return false
    }

    if (filters.rooms !== "all") {
      const roomsFilter = filters.rooms === "4" ? 4 : Number(filters.rooms)
      if (filters.rooms === "4") {
        if (!property.rooms || property.rooms < 4) return false
      } else if (property.rooms !== roomsFilter) {
        return false
      }
    }

    if (filters.district && !property.district?.toLowerCase().includes(filters.district.toLowerCase())) {
      return false
    }

    if (filters.minPrice && Number(property.price) < Number(filters.minPrice)) {
      return false
    }

    if (filters.maxPrice && Number(property.price) > Number(filters.maxPrice)) {
      return false
    }

    if (filters.minArea && Number(property.area) < Number(filters.minArea)) {
      return false
    }

    if (filters.maxArea && Number(property.area) > Number(filters.maxArea)) {
      return false
    }

    return true
  })

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот объект?")) return

    try {
      const response = await fetch(`/api/objects/${propertyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Объект успешно удален")
        loadProperties()
      } else {
        toast.error("Ошибка при удалении объекта")
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error("Ошибка при удалении объекта")
    }
  }

  if (loading) {
    return <Card className="p-8 text-center">Загрузка...</Card>
  }

  if (filteredProperties.length === 0) {
    return (
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BuildingIcon />
            </EmptyMedia>
            <EmptyTitle>Объекты не найдены</EmptyTitle>
            <EmptyDescription>Попробуйте изменить параметры фильтрации или добавьте новый объект</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/objects/new">
              <Button>Добавить объект</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default">Доступна</Badge>
      case "reserved":
        return <Badge variant="secondary">Зарезервирована</Badge>
      case "sold":
        return <Badge variant="outline">Продана</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (viewMode === "large") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{property.address}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">ID: {property.id}</p>
                  </div>
                  {getStatusBadge(property.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Цена:</span>
                    <p className="font-semibold">{formatPrice(property.price)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Площадь:</span>
                    <p className="font-semibold">{property.area} м²</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Комнаты:</span>
                    <p className="font-semibold">{property.rooms || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Район:</span>
                    <p className="font-semibold">{property.district || "—"}</p>
                  </div>
                </div>

                {property.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
                )}

                {property.owner && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-sm">Собственник:</span>
                    <p className="font-medium">{property.owner}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/objects/${property.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <EyeIcon className="size-4 mr-2" />
                      Просмотр
                    </Button>
                  </Link>
                  <Link href={`/objects/${property.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="size-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(property.id)}>
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="text-sm text-muted-foreground text-center">
          Показано {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredProperties.length)} из{" "}
          {filteredProperties.length} объектов
        </div>
      </div>
    )
  }

  // Standard view (table)
  return (
    <div className="space-y-4">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Цена</TableHead>
              <TableHead className="text-right">Площадь</TableHead>
              <TableHead>Собственник</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-mono text-xs">{property.id}</TableCell>
                <TableCell className="font-medium">{property.address}</TableCell>
                <TableCell>{getStatusBadge(property.status)}</TableCell>
                <TableCell className="text-right font-medium">{formatPrice(property.price)}</TableCell>
                <TableCell className="text-right">{property.area} м²</TableCell>
                <TableCell>{property.owner || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/objects/${property.id}`}>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="size-4" />
                      </Button>
                    </Link>
                    <Link href={`/objects/${property.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="size-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(property.id)}>
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Показано {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredProperties.length)} из{" "}
        {filteredProperties.length} объектов
      </div>
    </div>
  )
}
