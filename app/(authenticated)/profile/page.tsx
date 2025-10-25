"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { HistoryIcon, TrashIcon } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUsername, setCurrentUsername] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setCurrentUsername(storedUsername)
      setNewUsername(storedUsername)
    }
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentUsername,
          newUsername,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("username", newUsername)
        if (data.token) {
          localStorage.setItem("authToken", data.token)
        }
        setCurrentUsername(newUsername)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast.success("Профиль успешно обновлен")
      } else {
        toast.error(data.error || "Ошибка обновления профиля")
      }
    } catch (error) {
      console.error("[v0] Profile update error:", error)
      toast.error("Ошибка подключения к серверу")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearDatabase = () => {
    try {
      localStorage.removeItem("crm_properties")
      localStorage.removeItem("crm_clients")
      localStorage.removeItem("crm_showings")
      localStorage.removeItem("crm_admin_actions")
      toast.success("База данных успешно очищена")
      // Reload page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error("[v0] Clear database error:", error)
      toast.error("Ошибка при очистке базы данных")
    }
  }

  const isPasswordValid = !newPassword || (newPassword === confirmPassword && newPassword.length >= 5)

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Настройки профиля</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Управляйте своими учетными данными и настройками безопасности
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={() => router.push("/profile/history")}
        >
          <HistoryIcon className="size-4 mr-2" />
          История действий
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
            >
              <TrashIcon className="size-4 mr-2" />
              Очистить базу данных
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие удалит ВСЕ данные из базы: клиентов, объекты, показы и историю действий. Это действие
                необратимо и данные невозможно будет восстановить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearDatabase} className="bg-destructive hover:bg-destructive/90">
                Да, удалить все данные
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Информация профиля</CardTitle>
            <CardDescription>Обновите свой логин или измените пароль для повышения безопасности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newUsername">
                Логин <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newUsername"
                type="text"
                placeholder="Введите новый логин"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="currentPassword">
                Текущий пароль <span className="text-destructive">*</span>
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Введите текущий пароль"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Требуется для подтверждения изменений</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Изменить пароль (необязательно)</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Введите новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Минимум 5 символов</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Повторите новый пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={5}
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1">Пароли не совпадают</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="submit" disabled={isSubmitting || !isPasswordValid || !currentPassword}>
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </div>
  )
}
