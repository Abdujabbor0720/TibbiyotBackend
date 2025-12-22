"use client"

import Image from "next/image"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Globe, ChevronDown } from "lucide-react"
import { localeNames, locales, type Locale } from "@/lib/i18n/dictionaries"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  title?: string
}

export function AppHeader({ title }: AppHeaderProps) {
  const { locale, setLocale, theme, setTheme, telegramUser, t } = useApp()

  const availableLocales = locales.filter((l) => l !== locale)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50 safe-area-top">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full shadow-lg ring-[3px] ring-blue-500/80 group-hover:ring-blue-600 transition-all duration-300 bg-white">
            <Image src="/images/image.png" alt="TSDI Logo" fill className="object-contain p-0.5" priority />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{t.common.appName}</span>
        </Link>

        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-foreground hidden sm:block">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] backdrop-blur-xl bg-background/95 border-border/50">
              {availableLocales.map((l) => (
                <DropdownMenuItem key={l} onClick={() => setLocale(l as Locale)} className="text-sm cursor-pointer hover:bg-primary/10">
                  {localeNames[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/profile">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300 shadow-md">
              <AvatarImage
                src={telegramUser.photo_url || "/placeholder.svg?height=36&width=36&query=avatar"}
                alt={telegramUser.first_name}
              />
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                {telegramUser.first_name.charAt(0)}
                {telegramUser.last_name?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}
