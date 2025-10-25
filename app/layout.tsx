import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { ParticlesBackground } from "@/components/particles-background"
import { DecorativeVines } from "@/components/decorative-vines"
import { SnowEffect } from "@/components/snow-effect"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Liana",
  description: "Система управления недвижимостью",
  generator: "v0.app",
  icons: {
    icon: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ParticlesBackground />
          <DecorativeVines />
          <SnowEffect />
          <div className="relative z-10">{children}</div>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
