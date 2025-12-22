export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  colorScheme: "light" | "dark"
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    setText: (text: string) => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
    selectionChanged: () => void
  }
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  showPopup: (
    params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> },
    callback?: (id: string) => void,
  ) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

// Mock user for development (when not in Telegram WebApp)
// Using admin ID for testing admin features
const mockUser: TelegramUser = {
  id: 7108854464,
  first_name: "Abdujabbor",
  last_name: "Sharobiddinov",
  username: "AbdujabborSharobiddinov",
  language_code: "uz",
  photo_url: undefined,
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function getTelegramUser(): TelegramUser {
  const webApp = getTelegramWebApp()
  if (webApp?.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user
  }
  return mockUser
}

export function getTelegramColorScheme(): "light" | "dark" {
  const webApp = getTelegramWebApp()
  if (webApp?.colorScheme) {
    return webApp.colorScheme
  }
  return "light"
}

export function initTelegramWebApp(): void {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.ready()
    webApp.expand()
  }
}

export function hapticFeedback(
  type: "light" | "medium" | "heavy" | "success" | "error" | "warning" | "selection",
): void {
  const webApp = getTelegramWebApp()
  if (webApp?.HapticFeedback) {
    if (type === "selection") {
      webApp.HapticFeedback.selectionChanged()
    } else if (type === "success" || type === "error" || type === "warning") {
      webApp.HapticFeedback.notificationOccurred(type)
    } else {
      webApp.HapticFeedback.impactOccurred(type)
    }
  }
}
