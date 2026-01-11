"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsApi } from "@/lib/api"
import { Search, ImageIcon, Video, Music, FileText, Newspaper } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type MediaFilter = "all" | "photo" | "video" | "audio" | "text"

const mediaIcons: Record<string, typeof ImageIcon> = {
  photo: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
}

// Helper to get text - backend returns title/excerpt as strings for public endpoints
const getText = (item: any, field: string): string => {
  if (!item) return ""
  return item[field] || ""
}

// Helper to check if URL is a valid image (not PDF or other documents)
const isImageUrl = (url: string | undefined): boolean => {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  // Exclude PDFs and documents
  if (lowerUrl.includes('.pdf') || lowerUrl.includes('/raw/')) return false
  // Check for image extensions or cloudinary image path
  return lowerUrl.includes('/image/') || 
         lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|avif)/) !== null
}

export default function NewsPage() {
  const { locale, t, isAdmin } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<MediaFilter>("all")
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const filters: { key: MediaFilter; label: string; icon?: typeof ImageIcon }[] = [
    { key: "all", label: t.common.all },
    { key: "photo", label: t.news.photo, icon: ImageIcon },
    { key: "video", label: t.news.video, icon: Video },
    { key: "audio", label: t.news.audio, icon: Music },
  ]

  useEffect(() => {
    setLoading(true)
    newsApi.getAll({ page, limit: 10 })
      .then((res) => {
        // Backend qaytaradi: {success: true, data: {items: [...], total, page, limit, totalPages, hasMore}}
        if (res.success && res.data) {
          const data = res.data as any
          const newsItems = Array.isArray(data) ? data : data.items || []
          setNews(newsItems)
          setTotalPages(data.totalPages || 1)
          setHasMore(data.hasMore || false)
        } else {
          setError(res.error || t.news.noNews)
        }
      })
      .catch(() => setError("API error"))
      .finally(() => setLoading(false))
  }, [page])

  // Helper to determine media type from URL
  const getMediaTypeFromUrl = (item: any) => {
    if (!item.mediaUrls?.[0]) return 'text'
    const url = item.mediaUrls[0].toLowerCase()
    if (url.includes('/video/') || url.match(/\.(mp4|webm|mov)$/)) return 'video'
    if (url.match(/\.(mp3|wav|ogg|audio)$/)) return 'audio'
    if (url.match(/\.(jpg|jpeg|png|gif|webp)/) || url.includes('/image/')) return 'photo'
    return 'photo'
  }

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const titleText = getText(item, 'title')
      const excerptText = getText(item, 'excerpt')
      const matchesSearch =
        titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        excerptText.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Get media type from URL or use existing
      const itemMediaType = item.mediaType || getMediaTypeFromUrl(item)
      const matchesFilter = activeFilter === "all" || itemMediaType === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, activeFilter, news])

  return (
    <AppLayout title={t.news.title}>
      <div className="container max-w-md mx-auto px-3 py-3 space-y-3">
        {/* Search - Premium Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.news.search}
            className="pl-10 h-10 text-sm bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-md border-border/40 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        {/* Loading/Error State */}
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">{t.common.loading}</div>
        ) : error ? (
          <div className="py-10 text-center text-destructive">{error}</div>
        ) : null}

        {/* Filter Pills - Ajratilgan Tugmalar */}
        <div className="flex gap-[10px] overflow-x-auto pb-3 -mx-3 px-3 scrollbar-none">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              size="sm"
              className={cn(
                "shrink-0 h-10 gap-2.5 text-sm px-5 btn-animate rounded-2xl transition-all duration-300",
                activeFilter === filter.key 
                  ? "shadow-lg ring-2 ring-primary/40"
                  : "bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-md border-2 border-border/60 hover:border-primary/50 hover:bg-primary/10 shadow-md"
              )}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.icon && <filter.icon className="h-4 w-4" />}
              {filter.label}
            </Button>
          ))}
        </div>

        {/* News List */}
        {filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-xs text-muted-foreground">{t.news.noNews}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredNews.map((news) => (
              <NewsCard key={news.id} news={news} locale={locale} t={t} isAdmin={isAdmin} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-8 text-xs"
            >
              ← {t.common.back || "Oldingi"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="h-8 text-xs"
            >
              {t.common.next || "Keyingi"} →
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function NewsCard({
  news,
  locale,
  t,
  isAdmin = false,
}: {
  news: any
  locale: "uz-lat" | "uz-cyr" | "ru" | "en"
  t: ReturnType<typeof useApp>["t"]
  isAdmin?: boolean
}) {
  const titleText = getText(news, 'title')
  const excerptText = getText(news, 'excerpt')
  
  // Determine media type from URL
  const getMediaType = () => {
    if (!news.mediaUrls?.[0]) return 'text'
    const url = news.mediaUrls[0].toLowerCase()
    if (url.includes('/video/') || url.match(/\.(mp4|webm|mov)$/)) return 'video'
    if (url.match(/\.(mp3|wav|ogg|audio)$/)) return 'audio'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|image)/) || url.includes('/image/')) return 'photo'
    return 'photo' // default to photo for cloudinary images
  }
  
  const mediaType = news.mediaType || getMediaType()
  const Icon = mediaIcons[mediaType] || FileText
  const hasImage = news.mediaUrls?.[0] && isImageUrl(news.mediaUrls[0]) && (mediaType === 'photo' || mediaType === 'video')

  return (
    <Link href={`/news/${news.id}`}>
      <Card className="overflow-hidden card-animate bg-card/80 backdrop-blur-md border border-border/40 rounded-2xl shadow-lg !p-0 !gap-0">
        {hasImage && (
          <div className="relative w-full">
            <img
              src={news.mediaUrls[0]}
              alt={titleText}
              loading="lazy"
              className="w-full h-auto block rounded-t-2xl"
              style={{ maxHeight: '320px', objectFit: 'cover' }}
            />
          </div>
        )}
        <CardContent className={cn("p-4", !hasImage && "pt-4")}>
          {!hasImage && (
            <Badge className="mb-2 gap-1 text-[10px] h-5" variant="outline">
              <Icon className="h-3 w-3" />
              {t.news[mediaType] || mediaType}
            </Badge>
          )}
          <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-1.5">{titleText}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{excerptText}</p>
          <p className="text-[10px] text-muted-foreground/60">
            {news.publishedAt ? format(new Date(news.publishedAt), "dd.MM.yyyy HH:mm") : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
