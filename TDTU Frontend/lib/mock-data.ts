import type { Locale } from "@/lib/i18n/dictionaries"

// Typelar - backend bilan moslashtirilgan
export interface NewsItem {
  id: string
  title: string | Record<Locale, string>
  excerpt: string | Record<Locale, string>
  body?: string | Record<Locale, string>
  mediaType?: "photo" | "video" | "audio" | "text"
  mediaUrls?: string[]
  publishedAt: string
  hasMedia?: boolean
  createdAt?: string
  createdBy?: string
}

export interface ContactPerson {
  id: string
  fullName: string
  telegramId?: string
  position?: string | Record<Locale, string> | null
  department?: string | Record<Locale, string> | null
  description?: string | Record<Locale, string> | null
  photoUrl?: string | null
  email?: string | null
  phone?: string | null
  status: "active" | "inactive"
  createdAt?: string
}

export interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
}

// Mock data o'chirildi - faqat backend'dan kelgan ma'lumotlar ishlatiladi
export const newsMock: NewsItem[] = []

export const contactsMock: ContactPerson[] = []

export const activityLogMock: ActivityLog[] = []

export const adminStatsMock = {
  totalUsers: 0,
  totalContacts: 0,
  totalNews: 0,
  messagesToday: 0,
}

// Universitet ma'lumotlari - statik
export const universityInfo = {
  email: "info@tashpmi.uz",
  helpline: "+998(71) 214-89-46",
  address: {
    "uz-lat": "Taraqqiyot ko'chasi, Mirzo Ulug'bek tumani, Toshkent",
    "uz-cyr": "Тараққиёт кўчаси, Мирзо Улуғбек тумани, Тошкент",
    ru: "Улица Тараккиёт, Мирзо-Улугбекский район, Ташкент",
    en: "Taraqqiyot Street, Mirzo Ulugbek district, Tashkent",
  },
  workingHours: "09:00 - 18:00",
  website: "https://tashpmi.uz",
  mapUrl: "https://maps.google.com/?q=Tashkent+State+Dental+Institute",
  coordinates: {
    lat: 41.311389,
    lng: 69.279167,
  },
}
