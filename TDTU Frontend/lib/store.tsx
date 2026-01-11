"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type Locale, dictionaries, type Dictionary } from "@/lib/i18n/dictionaries"
import { getTelegramUser, getTelegramColorScheme, getTelegramWebApp, type TelegramUser } from "@/lib/telegram"
import { userApi } from "@/lib/api"

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

  // Authenticate with backend and get token
  useEffect(() => {
    if (!mounted) return
    
    const authenticateWithBackend = async () => {
      try {
        // Check if we already have a valid token
        const existingToken = localStorage.getItem('auth_token')
        if (existingToken && existingToken !== 'dev_mock_token') {
          // Verify token is still valid by fetching profile
          const profileResult = await userApi.getProfile(existingToken)
          if (profileResult.success) {
            console.log('[Auth] Existing token is valid')
            return
          }
          // Token is invalid, remove it and get new one
          console.log('[Auth] Token invalid, removing and getting new one')
          localStorage.removeItem('auth_token')
        } else if (existingToken === 'dev_mock_token') {
          // Old dev mock token - remove and get real one
          console.log('[Auth] Removing old dev mock token')
          localStorage.removeItem('auth_token')
        }
        
        // Get Telegram initData
        const webApp = getTelegramWebApp()
        const initData = webApp?.initData || ''
        
        if (!initData && process.env.NODE_ENV === 'development') {
          // Development mode - use dev-login endpoint
          console.log('[Auth] Development mode - using dev-login endpoint')
          
          // Use the admin telegram ID from our config
          const devTelegramUserId = ADMIN_TELEGRAM_IDS[0]?.toString() || '7108854464'
          const devResult = await userApi.devLogin(devTelegramUserId, 'Dev', 'Admin')
          
          if (devResult.success && devResult.data?.accessToken) {
            localStorage.setItem('auth_token', devResult.data.accessToken)
            console.log('[Auth] Dev authentication successful, token saved')
          } else {
            console.error('[Auth] Dev authentication failed:', devResult.error)
          }
          return
        }
        
        if (initData) {
          console.log('[Auth] Authenticating with Telegram initData...')
          const result = await userApi.validateTelegramUser(initData)
          if (result.success && result.data?.token) {
            localStorage.setItem('auth_token', result.data.token)
            console.log('[Auth] Authentication successful, token saved')
          } else {
            console.error('[Auth] Authentication failed:', result.error)
          }
        }
      } catch (error) {
        console.error('[Auth] Authentication error:', error)
      }
    }
    
    authenticateWithBackend()
  }, [mounted])

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
