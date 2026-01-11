"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryThumbnail } from "@/components/ui/cloudinary-image"
import { MediaUpload } from "@/components/ui/media-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { newsApi } from "@/lib/api"
import { ArrowLeft, Plus, Pencil, Trash2, Newspaper, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { hapticFeedback } from "@/lib/telegram"

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// Helper to get localized text
const getLocalizedText = (value: string | Record<string, string> | null | undefined, locale: string): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[locale] || value["uz-lat"] || value["en"] || Object.values(value)[0] || ""
}

export default function AdminNewsPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [news, setNews] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch news from backend (admin API for full data)
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
      return
    }
    
    const token = getAuthToken()
    if (!token) return
    
    setLoading(true)
    newsApi.getAllAdmin(token)
      .then((res) => {
        if (res.success && res.data) {
          const newsItems = Array.isArray(res.data) ? res.data : (res.data as any).items || []
          setNews(newsItems)
        }
      })
      .catch((err) => console.error("Failed to load news:", err))
      .finally(() => setLoading(false))
  }, [isAdmin, router])

  if (!isAdmin) return null

  const handleDelete = async (id: string) => {
    hapticFeedback("warning")
    const token = getAuthToken()
    if (!token) {
      alert("Token topilmadi. Qayta login qiling.")
      return
    }
    
    const result = await newsApi.delete(token, id)
    if (result.success) {
      setNews((prev) => prev.filter((n) => n.id !== id))
      hapticFeedback("success")
    } else {
      alert("O'chirishda xatolik: " + (result.error || "Noma'lum xatolik"))
    }
  }

  const handleSave = async (newsItem: any) => {
    const token = getAuthToken()
    
    setSaving(true)
    try {
      // Convert frontend format to backend DTO format
      const backendData = {
        titleUzLat: newsItem.titleUzLat || "",
        titleUzCyr: newsItem.titleUzCyr || "",
        titleRu: newsItem.titleRu || "",
        titleEn: newsItem.titleEn || "",
        bodyUzLat: newsItem.bodyUzLat || "",
        bodyUzCyr: newsItem.bodyUzCyr || "",
        bodyRu: newsItem.bodyRu || "",
        bodyEn: newsItem.bodyEn || "",
        mediaAssetIds: newsItem.mediaAssetIds,
        mediaUrls: newsItem.mediaUrls,
      }
      
      if (editingNews) {
        const result = await newsApi.update(token, editingNews.id, backendData)
        if (result.success) {
          // Refresh news list
          const refreshed = await newsApi.getAllAdmin(token)
          if (refreshed.success && refreshed.data) {
            const newsItems = Array.isArray(refreshed.data) ? refreshed.data : (refreshed.data as any).items || []
            setNews(newsItems)
          }
          setIsDialogOpen(false)
          hapticFeedback("success")
        } else {
          alert("Yangilashda xatolik: " + (result.error || "Noma'lum xatolik"))
        }
      } else {
        const result = await newsApi.create(token, backendData)
        if (result.success) {
          // Refresh news list
          const refreshed = await newsApi.getAllAdmin(token)
          if (refreshed.success && refreshed.data) {
            const newsItems = Array.isArray(refreshed.data) ? refreshed.data : (refreshed.data as any).items || []
            setNews(newsItems)
          }
          setIsDialogOpen(false)
          hapticFeedback("success")
        } else {
          alert("Qo'shishda xatolik: " + (result.error || "Noma'lum xatolik"))
        }
      }
    } catch (err) {
      console.error("Save error:", err)
      alert("Xatolik yuz berdi")
    } finally {
      setSaving(false)
      setEditingNews(null)
    }
  }

  const openEditDialog = (newsItem: NewsItem) => {
    setEditingNews(newsItem)
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingNews(null)
    setIsDialogOpen(true)
  }

  return (
    <AppLayout title={t.admin.manageNews} showFooter={false}>
      <div className="container max-w-md mx-auto px-3 py-3 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 -ml-2 h-8 text-xs btn-animate"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.common.back}
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Newspaper className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">{t.admin.manageNews}</h2>
          </div>
          <Button size="sm" className="gap-1 h-8 text-xs btn-animate" onClick={openAddDialog}>
            <Plus className="h-3.5 w-3.5" />
            {t.admin.addNews}
          </Button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : news.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-xs text-muted-foreground">{t.news.noNews}</p>
            </div>
          ) : (
          news.map((item) => {
            // Get title based on locale - backend returns titleUzLat, titleUzCyr, titleRu
            const titleText = locale === "ru" 
              ? (item.titleRu || item.titleUzLat || item.title || "")
              : locale === "uz-cyr"
                ? (item.titleUzCyr || item.titleUzLat || item.title || "")
                : (item.titleUzLat || item.title || "")
            return (
              <Card key={item.id} className="overflow-hidden card-animate">
                <CardContent className="p-3">
                  <div className="flex gap-2.5">
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-foreground line-clamp-2">{titleText}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {item.publishedAt ? format(new Date(item.publishedAt), "dd.MM.yyyy") : format(new Date(item.createdAt), "dd.MM.yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 btn-animate"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive btn-animate">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-sm">{t.common.delete}?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs">{t.admin.confirmDelete}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-8 text-xs">{t.common.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 text-xs"
                            >
                              {t.common.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <NewsFormDialog
            news={editingNews}
            onSave={handleSave}
            onClose={() => {
              setIsDialogOpen(false)
              setEditingNews(null)
            }}
            locale={locale}
            t={t}
          />
        </Dialog>
      </div>
    </AppLayout>
  )
}

function NewsFormDialog({
  news,
  onSave,
  onClose,
  locale,
  t,
}: {
  news: NewsItem | null
  onSave: (news: any) => void
  onClose: () => void
  locale: "uz-lat" | "uz-cyr" | "ru" | "en"
  t: ReturnType<typeof useApp>["t"]
}) {
  const [mediaFiles, setMediaFiles] = useState<Array<{id: string; url: string; publicId: string; type: string; name: string; size: number}>>([])
  
  // Get initial title and body from news item (check all language fields)
  const getInitialTitle = (newsItem: NewsItem | null) => {
    if (!newsItem) return ""
    return newsItem.titleUzLat || newsItem.titleUzCyr || newsItem.titleRu || newsItem.titleEn || 
           newsItem.title?.["uz-lat"] || newsItem.title?.["uz-cyr"] || newsItem.title?.["ru"] || newsItem.title?.["en"] || ""
  }
  
  const getInitialBody = (newsItem: NewsItem | null) => {
    if (!newsItem) return ""
    return newsItem.bodyUzLat || newsItem.bodyUzCyr || newsItem.bodyRu || newsItem.bodyEn ||
           newsItem.body?.["uz-lat"] || newsItem.body?.["uz-cyr"] || newsItem.body?.["ru"] || newsItem.body?.["en"] || ""
  }
  
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  
  // Reset form when news prop changes
  useEffect(() => {
    setTitle(getInitialTitle(news))
    setBody(getInitialBody(news))
    // Convert existing mediaUrls to mediaFiles format
    if (news?.mediaUrls && news.mediaUrls.length > 0) {
      setMediaFiles(news.mediaUrls.map((url, index) => ({
        id: `existing-${index}`,
        url,
        publicId: `existing-${index}`,
        type: url.includes('/video/') ? 'video' : 'image',
        name: url.split('/').pop() || 'file',
        size: 0,
      })))
    } else {
      setMediaFiles([])
    }
  }, [news])

  const handleSubmit = () => {
    // Send same text to all language fields (admin writes in their preferred language)
    onSave({
      titleUzLat: title,
      titleUzCyr: title,
      titleRu: title,
      titleEn: title,
      bodyUzLat: body,
      bodyUzCyr: body,
      bodyRu: body,
      bodyEn: body,
      mediaUrls: mediaFiles.map(f => f.url),
    })
  }

  return (
    <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">{news ? t.admin.editNews : t.admin.addNews}</DialogTitle>
        <DialogDescription className="text-xs">
          {locale === "en"
            ? "Fill in news information for all languages"
            : locale === "ru"
              ? "Заполните информацию о новости на всех языках"
              : "Yangilik ma'lumotlarini kiriting"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-3">
        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.newsTitle}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              locale === "ru" ? "Заголовок новости" : locale === "uz-cyr" ? "Янгилик сарлавҳаси" : locale === "en" ? "News title" : "Yangilik sarlavhasi"
            }
            className="h-9 text-sm"
          />
        </div>
        
        {/* Body */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.newsBody}</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              locale === "ru" ? "Текст новости..." : locale === "uz-cyr" ? "Янгилик матни..." : locale === "en" ? "News content..." : "Yangilik matni..."
            }
            rows={4}
            className="text-sm"
          />
        </div>
        
        {/* Media Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            {locale === "ru" ? "Медиа файлы" : locale === "en" ? "Media files" : "Media fayllar"}
          </Label>
          <p className="text-[10px] text-muted-foreground">
            {locale === "ru" 
              ? "Добавьте фото, видео или документы к новости" 
              : locale === "en" 
                ? "Add photos, videos or documents to the news" 
                : "Yangilikka rasm, video yoki hujjatlar qo'shing"}
          </p>
          <MediaUpload
            value={mediaFiles}
            onChange={setMediaFiles}
            accept="all"
            multiple={true}
            maxFiles={10}
            maxSize={50}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="h-8 text-xs btn-animate bg-transparent">
          {t.common.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title || !body}
          className="h-8 text-xs btn-animate"
        >
          {t.common.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
