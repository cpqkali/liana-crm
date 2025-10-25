"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log("[v0] Starting login attempt for:", username)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      console.log("[v0] Login response status:", response.status)

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Ошибка сервера" }))
        console.log("[v0] Login failed:", data.error)
        toast.error(data.error || "Неверное имя пользователя или пароль")
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      console.log("[v0] Login successful, received data:", data)

      localStorage.setItem("username", data.username)
      localStorage.setItem("adminName", data.name)

      toast.success("Вход выполнен успешно")

      console.log("[v0] Redirecting to /home")
      window.location.href = "/home"
    } catch (error) {
      console.error("[v0] Login error:", error)
      toast.error("Ошибка подключения к серверу")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-6 flex flex-col items-center pb-2">
          <Image src="/logo.jpg" alt="Liana" width={120} height={40} priority />
          <CardDescription className="text-center text-base">
            Профессиональная система управления недвижимостью
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Вход..." : "Войти"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Войдите в систему для управления объектами недвижимости, клиентами и показами
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
