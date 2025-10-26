"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { Showing, Property } from "@/lib/db"

interface ShowingsCalendarProps {
  showings: Showing[]
  properties: Property[]
}

export function ShowingsCalendar({ showings, properties }: ShowingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [daysInMonth, setDaysInMonth] = useState<(number | null)[]>([])

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()

    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(i)
    }

    setDaysInMonth(days)
  }, [currentDate])

  const getShowingsForDate = (day: number) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const date = String(day).padStart(2, "0")
    const dateStr = `${year}-${month}-${date}`

    return showings.filter((s) => s.date === dateStr)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthName = currentDate.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Календарь показов</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              {monthName}
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {daysInMonth.map((day, index) => {
            const showingsForDay = day ? getShowingsForDate(day) : []
            const isToday =
              day &&
              new Date().getFullYear() === currentDate.getFullYear() &&
              new Date().getMonth() === currentDate.getMonth() &&
              new Date().getDate() === day

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-lg ${
                  day ? "bg-background" : "bg-muted/30"
                } ${isToday ? "border-primary bg-primary/5" : ""}`}
              >
                {day && (
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${isToday ? "text-primary" : ""}`}>{day}</div>
                    <div className="space-y-1">
                      {showingsForDay.slice(0, 2).map((showing) => {
                        const property = properties.find((p) => p.id === showing.objectId)
                        return (
                          <Badge key={showing.id} variant="secondary" className="text-xs block truncate">
                            {showing.time} - {property?.address.split(",")[0]}
                          </Badge>
                        )
                      })}
                      {showingsForDay.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{showingsForDay.length - 2} еще
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
