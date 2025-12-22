"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryImage, CloudinaryVideo } from "@/components/ui/cloudinary-image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { newsMock } from "@/lib/mock-data"
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
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { hapticFeedback } from "@/lib/telegram"

const mediaIcons = {
  photo: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { locale, t } = useApp()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const news = newsMock.find((n) => n.id === id)

  if (!news) {
    return (
      <AppLayout title={t.news.title}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xs text-muted-foreground">{t.news.noNews}</p>
          <Button variant="link" onClick={() => router.back()} className="text-xs">
            {t.common.back}
          </Button>
        </div>
      </AppLayout>
    )
  }

  const Icon = mediaIcons[news.mediaType]
  const hasMultipleImages = news.mediaUrls && news.mediaUrls.length > 1

  const handleShare = () => {
    hapticFeedback("light")
    if (navigator.share) {
      navigator.share({
        title: news.title[locale],
        text: news.excerpt[locale],
        url: window.location.href,
      })
    }
  }

  const nextImage = () => {
    if (news.mediaUrls) {
      setCurrentImageIndex((prev) => (prev + 1) % news.mediaUrls!.length)
    }
  }

  const prevImage = () => {
    if (news.mediaUrls) {
      setCurrentImageIndex((prev) => (prev - 1 + news.mediaUrls!.length) % news.mediaUrls!.length)
    }
  }

  return (
    <AppLayout title={t.news.title} showFooter={false}>
      <div className="container max-w-lg mx-auto">
        <div className="sticky top-12 z-40 bg-background/95 backdrop-blur border-b px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 -ml-2 h-8 text-xs btn-animate"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.common.back}
          </Button>
        </div>

        {news.mediaType === "photo" && news.mediaUrls?.[0] && (
          <div className="relative bg-muted">
            <div className="relative aspect-video">
              <CloudinaryImage
                src={news.mediaUrls[currentImageIndex]}
                alt={news.title[locale]}
                width={600}
                height={340}
                className="w-full h-full"
                priority
              />
            </div>
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-80 btn-animate"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-80 btn-animate"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
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

        {news.mediaType === "video" && news.mediaUrls?.[0] && (
          <div className="relative bg-black aspect-video">
            {isPlaying ? (
              <CloudinaryVideo
                src={news.mediaUrls[0]}
                width={600}
                height={340}
                className="w-full h-full"
                autoPlay
                controls
              />
            ) : (
              <>
                <CloudinaryImage
                  src={news.mediaUrls[0]}
                  alt={news.title[locale]}
                  width={600}
                  height={340}
                  className="w-full h-full opacity-80"
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
          <Card className="mx-3 mt-3">
            <CardContent className="p-3">
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
          </Card>
        )}

        <div className="px-3 py-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="gap-0.5 text-[10px] h-5">
              <Icon className="h-3 w-3" />
              {t.news[news.mediaType]}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(news.publishedAt), "dd.MM.yyyy HH:mm")}
            </span>
          </div>

          <h1 className="text-base font-bold text-foreground leading-tight">{news.title[locale]}</h1>

          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{news.body[locale]}</p>

          <div className="pt-3">
            <Button
              variant="outline"
              className="w-full gap-1.5 h-9 text-xs bg-transparent btn-animate"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              {t.common.share}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
