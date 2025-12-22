"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type Locale, dictionaries, type Dictionary } from "@/lib/i18n/dictionaries"
import { getTelegramUser, getTelegramColorScheme, type TelegramUser } from "@/lib/telegram"

// Admin Telegram ID - should match backend ADMIN_TELEGRAM_ID
export const ADMIN_TELEGRAM_IDS = [7108854464]

export interface UserProfile {
  firstName: string
  lastName: string
  avatarUrl?: string
  course?: number
  major?: string
  group?: string
}

export interface AppState {
  locale: Locale
  theme: "light" | "dark" | "system"
  isOnboarded: boolean
  profile: UserProfile | null
  telegramUser: TelegramUser
}

interface AppContextType extends AppState {
  setLocale: (locale: Locale) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setProfile: (profile: UserProfile) => void
  completeOnboarding: () => void
  isAdmin: boolean // Now computed from telegram ID
  t: Dictionary
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = "tdsu-webapp-state"

function getInitialState(): AppState {
  if (typeof window === "undefined") {
    return {
      locale: "uz-lat",
      theme: "system",
      isOnboarded: false,
      profile: null,
      telegramUser: getTelegramUser(),
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...parsed,
        telegramUser: getTelegramUser(),
      }
    }
  } catch {
    // ignore
  }

  return {
    locale: "uz-lat",
    theme: getTelegramColorScheme() === "dark" ? "dark" : "light",
    isOnboarded: false,
    profile: null,
    telegramUser: getTelegramUser(),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setState(getInitialState())
  }, [])

  useEffect(() => {
    if (mounted) {
      const { telegramUser, ...toStore } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    }
  }, [state, mounted])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove("light", "dark")

    if (state.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(state.theme)
    }
  }, [state.theme, mounted])

  const setLocale = (locale: Locale) => {
    setState((prev) => ({ ...prev, locale }))
  }

  const setTheme = (theme: "light" | "dark" | "system") => {
    setState((prev) => ({ ...prev, theme }))
  }

  const setProfile = (profile: UserProfile) => {
    setState((prev) => ({ ...prev, profile }))
  }

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, isOnboarded: true }))
  }

  const isAdmin = ADMIN_TELEGRAM_IDS.includes(state.telegramUser.id)

  const t = dictionaries[state.locale]

  if (!mounted) {
    return null
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLocale,
        setTheme,
        setProfile,
        completeOnboarding,
        isAdmin,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
