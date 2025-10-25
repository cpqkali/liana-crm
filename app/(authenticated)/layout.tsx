"use client"

import type React from "react"
import { NavHeader } from "@/components/nav-header"
import { PageTransition } from "@/components/page-transition"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The middleware will redirect unauthenticated users to login before they reach this layout

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />
      <div className="flex-1">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  )
}
