"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { removeAuthTokenFromStorage } from "@/lib/auth"

export function NavHeader() {
  const [username, setUsername] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
    } finally {
      removeAuthTokenFromStorage()
      router.push("/")
      router.refresh()
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full">
            <Image src="/logo.jpg" alt="Liana" width={100} height={33} priority />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Настройки профиля</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Выйти</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <nav className="flex gap-1">
            <Link href="/home">
              <Button variant={pathname === "/home" ? "secondary" : "ghost"} size="sm">
                Главная
              </Button>
            </Link>
            <Link href="/objects">
              <Button
                variant={pathname === "/objects" || pathname?.startsWith("/objects/") ? "secondary" : "ghost"}
                size="sm"
              >
                Объекты
              </Button>
            </Link>
            <Link href="/clients">
              <Button
                variant={pathname === "/clients" || pathname?.startsWith("/clients/") ? "secondary" : "ghost"}
                size="sm"
              >
                Клиенты
              </Button>
            </Link>
            <Link href="/showings">
              <Button variant={pathname === "/showings" ? "secondary" : "ghost"} size="sm">
                Показы
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
