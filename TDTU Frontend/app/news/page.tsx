"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsApi } from "@/lib/api"
import { Search, ImageIcon, Video, Music, FileText, Newspaper } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type MediaFilter = "all" | "photo" | "video" | "audio" | "text"

const mediaIcons = {
  photo: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
}

export default function NewsPage() {
  const { locale, t, isAdmin } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<MediaFilter>("all")
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filters: { key: MediaFilter; label: string; icon?: typeof ImageIcon }[] = [
    { key: "all", label: t.common.all },
    { key: "photo", label: t.news.photo, icon: ImageIcon },
    { key: "video", label: t.news.video, icon: Video },
    { key: "audio", label: t.news.audio, icon: Music },
  ]

  useEffect(() => {
    setLoading(true)
    newsApi.getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNews(res.data)
        } else {
          setError(res.error || t.news.noNews)
        }
      })
      .catch(() => setError("API error"))
      .finally(() => setLoading(false))
  }, [])

  const filteredNews = useMemo(() => {
    return news.filter((news) => {
      const matchesSearch =
        news.title[locale]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.excerpt?.[locale]?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = activeFilter === "all" || news.mediaType === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, activeFilter, locale, news])

  return (
    <AppLayout title={t.news.title}>
      <div className="container max-w-lg lg:max-w-4xl mx-auto px-3 lg:px-6 py-3 lg:py-5 space-y-3">
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
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            {filteredNews.map((news) => (
              <NewsCard key={news.id} news={news} locale={locale} t={t} isAdmin={isAdmin} />
            ))}
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
  news: NewsItem
  locale: "uz-lat" | "uz-cyr" | "ru" | "en"
  t: ReturnType<typeof useApp>["t"]
  isAdmin?: boolean
}) {
  const Icon = mediaIcons[news.mediaType]

  return (
    <Link href={`/news/${news.id}`}>
      <Card className="overflow-hidden card-animate h-full bg-card/60 backdrop-blur-md border-border/30">
        {news.mediaUrls?.[0] && (
          <div className="relative h-36 lg:h-44 w-full bg-muted">
            <CloudinaryImage
              src={news.mediaUrls[0]}
              alt={news.title[locale]}
              width={400}
              height={180}
              className="w-full h-full"
            />
            {/* Badge only visible for admin */}
            {isAdmin && (
              <Badge className="absolute top-2 right-2 gap-0.5 text-[9px] h-5" variant="secondary">
                <Icon className="h-2.5 w-2.5" />
                {t.news[news.mediaType]}
              </Badge>
            )}
          </div>
        )}
        <CardContent className={cn("p-2.5 lg:p-3", !news.mediaUrls?.[0] && "pt-2.5 lg:pt-3")}>
          {!news.mediaUrls?.[0] && isAdmin && (
            <Badge className="mb-1.5 gap-0.5 text-[9px] h-4" variant="outline">
              <Icon className="h-2.5 w-2.5" />
              {t.news[news.mediaType]}
            </Badge>
          )}
          <h3 className="font-semibold text-[13px] lg:text-sm text-foreground line-clamp-2 mb-1">{news.title[locale]}</h3>
          <p className="text-[11px] lg:text-xs text-muted-foreground line-clamp-2 mb-1.5">{news.excerpt[locale]}</p>
          <p className="text-[9px] lg:text-[10px] text-muted-foreground/70">
            {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
