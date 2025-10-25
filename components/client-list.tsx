"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { UsersIcon, EyeIcon, PencilIcon, TrashIcon, PhoneIcon, PhoneOffIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Client } from "@/lib/db"
import { formatPhoneNumber } from "@/lib/format"

interface ClientListProps {
  filters: {
    search: string
    waiting_for_showing: string
    is_hidden: string
    call_status: string
  }
}

export function ClientList({ filters }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadClients()
  }, [filters])

  const loadClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.waiting_for_showing !== "all") {
        params.append("waiting_for_showing", filters.waiting_for_showing)
      }
      if (filters.is_hidden !== "all") {
        params.append("is_hidden", filters.is_hidden)
      }

      const response = await fetch(`/api/clients?${params}`)
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("[v0] Load clients error:", error)
      toast.error("Ошибка загрузки клиентов")
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        client.name.toLowerCase().includes(searchLower) ||
        client.phone.toLowerCase().includes(searchLower) ||
        client.id.toString().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filters.call_status !== "all" && client.call_status !== filters.call_status) {
      return false
    }

    return true
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  const toggleCallStatus = async (clientId: number, currentStatus: string) => {
    const newStatus = currentStatus === "called" ? "not_called" : "called"

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_status: newStatus }),
      })

      if (response.ok) {
        toast.success(newStatus === "called" ? "Отмечено: дозвонились" : "Отмечено: не звонили")
        loadClients()
      }
    } catch (error) {
      toast.error("Ошибка обновления статуса")
    }
  }

  const handleDelete = async (clientId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого клиента?")) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Клиент успешно удален")
        loadClients()
      } else {
        toast.error("Ошибка при удалении клиента")
      }
    } catch (error) {
      toast.error("Ошибка при удалении клиента")
    }
  }

  if (loading) {
    return <Card className="p-8 text-center">Загрузка...</Card>
  }

  if (filteredClients.length === 0) {
    return (
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Клиенты не найдены</EmptyTitle>
            <EmptyDescription>Попробуйте изменить параметры фильтрации или добавьте нового клиента</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/clients/new">
              <Button>Добавить клиента</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Звонок</TableHead>
              <TableHead>Дата добавления</TableHead>
              <TableHead>Примечание</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-mono text-xs">{client.id}</TableCell>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-sm">{formatPhoneNumber(client.phone)}</TableCell>
                <TableCell>
                  <Button
                    variant={client.call_status === "called" ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCallStatus(client.id, client.call_status)}
                    className="gap-1"
                  >
                    {client.call_status === "called" ? (
                      <PhoneIcon className="size-3" />
                    ) : (
                      <PhoneOffIcon className="size-3" />
                    )}
                    {client.call_status === "called" ? "Дозвонились" : "Не звонили"}
                  </Button>
                </TableCell>
                <TableCell className="text-sm">{new Date(client.date_added).toLocaleDateString("ru-RU")}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{client.call_notes || client.notes || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <EyeIcon />
                        <span className="sr-only">Просмотр</span>
                      </Button>
                    </Link>
                    <Link href={`/clients/${client.id}/edit`}>
                      <Button variant="ghost" size="icon-sm">
                        <PencilIcon />
                        <span className="sr-only">Редактировать</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(client.id)}>
                      <TrashIcon />
                      <span className="sr-only">Удалить</span>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
        Показано {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredClients.length)} из{" "}
        {filteredClients.length} клиентов
      </div>
    </div>
  )
}
