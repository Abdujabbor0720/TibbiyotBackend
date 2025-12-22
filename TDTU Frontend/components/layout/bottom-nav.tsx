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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 safe-area-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
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
                "relative flex flex-col items-center justify-center gap-1 py-2 px-4 transition-all duration-300 rounded-2xl min-w-[60px]",
                "active:scale-90 hover:bg-primary/5",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Glow effect for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-sm" />
              )}
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-xl p-2 transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 shadow-md ring-1 ring-primary/30" 
                    : "bg-transparent",
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "stroke-[2.5px] scale-110")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300", 
                isActive && "font-bold text-primary"
              )}>
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
