"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { newsApi } from "@/lib/api"
import { ArrowRight, Newspaper, Users, Bell, ImageIcon, Video, Music } from "lucide-react"
import { format } from "date-fns"

const mediaIcons: Record<string, typeof ImageIcon> = {
  photo: ImageIcon,
  video: Video,
  audio: Music,
  text: Newspaper,
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

// Helper to get text - backend returns title/excerpt as strings for public endpoints
const getText = (item: any, field: string): string => {
  if (!item) return ""
  // Public endpoint returns title, excerpt as strings directly
  return item[field] || ""
}

export default function HomePage() {
  const { locale, t, profile, telegramUser, isAdmin } = useApp()
  const [isLoading, setIsLoading] = useState(true)
  const [latestNews, setLatestNews] = useState<any | null>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    // Backend'dan yangiliklar olish
    newsApi.getAll({ limit: 4 })
      .then((res) => {
        if (res.success && res.data) {
          // Backend qaytaradi: {success: true, data: {items: [...], total: N}}
          const newsItems = Array.isArray(res.data) ? res.data : (res.data as any).items || []
          if (newsItems.length > 0) {
            setLatestNews(newsItems[0])
            setAnnouncements(newsItems.slice(1, 4))
          }
        }
      })
      .catch((err) => console.error("News fetch error:", err))
      .finally(() => setIsLoading(false))
  }, [])

  const userName = profile?.firstName || telegramUser.first_name

  return (
    <AppLayout title={t.nav.home}>
      <div className="container max-w-md mx-auto px-3 py-3 space-y-3">
        {/* Welcome Message */}
        <div className="space-y-1 mb-2">
          <h2 className="text-base font-bold text-foreground">
            {t.home.greeting}, {userName}!
          </h2>
          <p className="text-xs text-muted-foreground">{t.home.welcomeMessage}</p>
        </div>

        {/* Latest News Hero */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-foreground">{t.home.latestNews}</h3>
            <Link
              href="/news"
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 btn-animate"
            >
              {t.home.allNews}
              <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>

          {isLoading ? (
            <Card className="overflow-hidden bg-card/50 backdrop-blur-sm rounded-2xl">
              <Skeleton className="w-full" style={{ aspectRatio: '4/3' }} />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ) : latestNews ? (
            <Link href={`/news/${latestNews.id}`}>
              <Card className="overflow-hidden card-animate bg-card/80 backdrop-blur-md border border-border/40 rounded-2xl shadow-lg">
                {latestNews.mediaUrls?.[0] && isImageUrl(latestNews.mediaUrls[0]) && (
                  <div className="relative w-full">
                    <img
                      src={latestNews.mediaUrls[0]}
                      alt={getText(latestNews, 'title')}
                      loading="lazy"
                      className="w-full h-auto block"
                      style={{ maxHeight: '280px', objectFit: 'cover' }}
                    />
                    {isAdmin && latestNews.mediaType && (
                      <Badge className="absolute top-2 right-2 gap-0.5 text-[9px] h-4" variant="secondary">
                        {(() => {
                          const Icon = mediaIcons[latestNews.mediaType] || Newspaper
                          return <Icon className="h-2.5 w-2.5" />
                        })()}
                        {latestNews.mediaType && (t.news as Record<string, string>)[latestNews.mediaType]}
                      </Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-3">
                  <h4 className="font-bold text-sm text-foreground line-clamp-2 mb-1.5">
                    {getText(latestNews, 'title')}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{getText(latestNews, 'excerpt')}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    {format(new Date(latestNews.publishedAt), "dd.MM.yyyy HH:mm:ss")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="overflow-hidden bg-card/50 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6 text-center">
                <Newspaper className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{t.news.noNews}</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Quick Actions - Premium Kreativ Design */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">{t.home.quickActions}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/news">
              <Card className="card-animate h-full bg-gradient-to-br from-card/70 via-card/50 to-card/30 backdrop-blur-xl border-border/40 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/5 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                    <Newspaper className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold">{t.home.allNews}</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/contacts">
              <Card className="card-animate h-full bg-gradient-to-br from-card/70 via-card/50 to-card/30 backdrop-blur-xl border-border/40 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/5 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold">{t.home.contactsDirectory}</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Announcements - Ajratilgan Kartalar */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">{t.home.announcements}</h3>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-2 border-border/50">
                  <CardContent className="p-4 flex gap-4">
                    <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((news) => (
                <Link key={news.id} href={`/news/${news.id}`}>
                  <Card className="card-animate bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4 flex gap-4">
                      {news.mediaUrls?.[0] && isImageUrl(news.mediaUrls[0]) ? (
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0 ring-2 ring-border/30">
                          <img
                            src={news.mediaUrls[0]}
                            alt={getText(news, 'title')}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                          <Newspaper className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2">{getText(news, 'title')}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(news.publishedAt), "dd.MM.yyyy HH:mm:ss")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{t.news.noNews}</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
