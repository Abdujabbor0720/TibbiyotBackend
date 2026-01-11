"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryImage, CloudinaryVideo } from "@/components/ui/cloudinary-image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { newsApi } from "@/lib/api"
import {
  ArrowLeft,
  Share2,
  ImageIcon,
  Video,
  Music,
  FileText,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Newspaper,
  Copy,
  Send,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { hapticFeedback, openTelegramShare, getTelegramWebApp } from "@/lib/telegram"

const mediaIcons: Record<string, typeof ImageIcon> = {
  photo: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
}

// Helper to check if URL is an image (not PDF or doc)
const isImageUrl = (url: string) => !url.match(/\.(pdf|doc|docx)$/i)

// Helper to get localized text
const getLocalizedText = (value: string | Record<string, string> | null | undefined, locale: string): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[locale] || value["uz-lat"] || value["en"] || Object.values(value)[0] || ""
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { locale, t } = useApp()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [news, setNews] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    newsApi.getById(id)
      .then((res) => {
        if (res.success && res.data) {
          setNews(res.data)
        } else {
          setError(res.error || t.news.noNews)
        }
      })
      .catch(() => setError("API error"))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = async () => {
    if (news) {
      hapticFeedback("light")
      const shareData = {
        title: getLocalizedText(news.title, locale),
        text: getLocalizedText(news.excerpt, locale),
        url: window.location.href,
      }
      
      // Try native share first
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
          return
        } catch (err) {
          // User cancelled or error - fallback to Telegram
        }
      }
      
      // Fallback to Telegram share
      handleShareTelegram()
    }
  }

  const handleShareTelegram = () => {
    if (news) {
      hapticFeedback("light")
      const title = getLocalizedText(news.title, locale)
      const text = getLocalizedText(news.excerpt, locale)
      const url = window.location.href
      const shareText = `📰 ${title}\n\n${text}`
      openTelegramShare(url, shareText)
    }
  }

  const handleCopyLink = async () => {
    if (news) {
      hapticFeedback("light")
      const title = getLocalizedText(news.title, locale)
      const text = getLocalizedText(news.excerpt, locale)
      const url = window.location.href
      const shareText = `📰 ${title}\n\n${text}\n\n🔗 ${url}`
      
      try {
        await navigator.clipboard.writeText(shareText)
        hapticFeedback("success")
        alert(locale === "ru" ? "Скопировано!" : "Nusxalandi!")
      } catch (err) {
        // Fallback
        const textArea = document.createElement("textarea")
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        hapticFeedback("success")
        alert(locale === "ru" ? "Скопировано!" : "Nusxalandi!")
      }
    }
  }

  const nextImage = () => {
    if (news?.mediaUrls) {
      setCurrentImageIndex((prev) => (prev + 1) % news.mediaUrls!.length)
    }
  }

  const prevImage = () => {
    if (news?.mediaUrls) {
      setCurrentImageIndex((prev) => (prev - 1 + news.mediaUrls!.length) % news.mediaUrls!.length)
    }
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout title={t.news.title} showFooter={false}>
        <div className="container max-w-md mx-auto px-3">
          <div className="sticky top-12 z-40 bg-background/95 backdrop-blur border-b px-3 py-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2 h-8 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.common.back}
            </Button>
          </div>
          <Skeleton className="w-full aspect-video" />
          <div className="px-3 py-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error or no news
  if (error || !news) {
    return (
      <AppLayout title={t.news.title}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Newspaper className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-xs text-muted-foreground">{error || t.news.noNews}</p>
          <Button variant="link" onClick={() => router.back()} className="text-xs">
            {t.common.back}
          </Button>
        </div>
      </AppLayout>
    )
  }

  const Icon = news.mediaType ? mediaIcons[news.mediaType] : FileText
  const hasMultipleImages = news.mediaUrls && news.mediaUrls.length > 1
  const titleText = getLocalizedText(news.title, locale)
  const excerptText = getLocalizedText(news.excerpt, locale)
  const bodyText = getLocalizedText(news.body, locale)

  return (
    <AppLayout title={t.news.title} showFooter={false}>
      <div className="container max-w-md mx-auto px-3">
        <div className="sticky top-12 z-40 bg-background/95 backdrop-blur py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 h-8 text-xs rounded-xl"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.common.back}
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl mt-3 border-0 shadow-lg relative !p-0 !gap-0">
          {news.mediaUrls?.[0] && isImageUrl(news.mediaUrls[0]) && !news.mediaUrls[0].includes('/video/') && (
            <div className="relative">
              <img
                src={news.mediaUrls[currentImageIndex]}
                alt={titleText}
                loading="lazy"
                className="w-full h-auto block rounded-t-2xl"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
              {hasMultipleImages && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-80 z-20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-80 z-20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                    {news.mediaUrls.map((_, idx) => (
                      <button
                        key={idx}
                        className={cn(
                          "h-1 rounded-full transition-all",
                          idx === currentImageIndex ? "w-3 bg-white" : "w-1 bg-white/50",
                        )}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        {news.mediaUrls?.[0] && isImageUrl(news.mediaUrls[0]) && news.mediaUrls[0].includes('/video/') && (
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
            {isPlaying ? (
              <video
                src={news.mediaUrls[0]}
                className="w-full h-full object-cover"
                autoPlay
                controls
              />
            ) : (
              <>
                <img
                  src={news.mediaUrls[0].replace('/video/', '/image/').replace(/\.[^/.]+$/, '.jpg')}
                  alt={titleText}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-14 w-14 rounded-full btn-animate"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="h-6 w-6 ml-0.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

          {news.mediaType === "audio" && (
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0 btn-animate"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <div className="flex-1">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-muted-foreground">1:24</span>
                    <span className="text-[10px] text-muted-foreground">4:30</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="p-4 space-y-3">
            {news.mediaType && (
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="gap-0.5 text-[10px] h-5">
                  <Icon className="h-3 w-3" />
                  {t.news[news.mediaType]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(news.publishedAt), "dd.MM.yyyy HH:mm")}
                </span>
              </div>
            )}

            <h1 className="text-base font-bold text-foreground leading-tight">{titleText}</h1>

            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{bodyText || excerptText}</p>

            <div className="pt-3 flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 h-9 text-xs bg-transparent btn-animate"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {t.common.share}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={handleShareTelegram} className="gap-2 cursor-pointer">
                    <Send className="h-4 w-4" />
                    <span>{locale === "ru" ? "Отправить в Telegram" : "Telegramga yuborish"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                    <Copy className="h-4 w-4" />
                    <span>{locale === "ru" ? "Копировать ссылку" : "Havolani nusxalash"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
