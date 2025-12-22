"use client"

import type { ReactNode } from "react"
import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"
import { PageFooter } from "./page-footer"
import { SeasonalBackground } from "./seasonal-background"

interface AppLayoutProps {
  children: ReactNode
  title?: string
  showFooter?: boolean
}

export function AppLayout({ children, title, showFooter = true }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background/80 backdrop-blur-sm">
      <SeasonalBackground />
      <AppHeader title={title} />
      <main className="flex-1 pb-20">
        {children}
        {showFooter && <PageFooter />}
      </main>
      <BottomNav />
    </div>
  )
}
