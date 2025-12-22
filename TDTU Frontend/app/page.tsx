"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { initTelegramWebApp } from "@/lib/telegram"

export default function RootPage() {
  const router = useRouter()
  const { isOnboarded } = useApp()

  useEffect(() => {
    initTelegramWebApp()

    if (isOnboarded) {
      router.replace("/home")
    } else {
      router.replace("/onboarding")
    }
  }, [isOnboarded, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-primary/20" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
