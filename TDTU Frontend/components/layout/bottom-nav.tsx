"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Home, Newspaper, Users, User, Shield } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"

export function BottomNav() {
  const pathname = usePathname()
  const { isAdmin, t } = useApp()

  const navItems = [
    { href: "/home", icon: Home, label: t.nav.home },
    { href: "/news", icon: Newspaper, label: t.nav.news },
    { href: "/contacts", icon: Users, label: t.nav.contacts },
    { href: "/profile", icon: User, label: t.nav.profile },
    ...(isAdmin ? [{ href: "/admin", icon: Shield, label: t.nav.admin }] : []),
  ]

  const handleClick = () => {
    hapticFeedback("selection")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all duration-200 rounded-xl min-w-[56px]",
                "active:scale-95",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 transition-all duration-200",
                  isActive 
                    ? "bg-primary/15" 
                    : "bg-transparent",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium", 
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
