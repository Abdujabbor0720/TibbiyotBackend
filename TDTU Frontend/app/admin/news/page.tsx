"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryImage, CloudinaryThumbnail } from "@/components/ui/cloudinary-image"
import { ImageUploadButton } from "@/components/ui/file-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { newsMock, type NewsItem } from "@/lib/mock-data"
import { ArrowLeft, Plus, Pencil, Trash2, Newspaper, ImageIcon, Video, Music, FileText, Upload } from "lucide-react"
import { format } from "date-fns"
import { hapticFeedback } from "@/lib/telegram"

const mediaIcons = {
  photo: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
}

export default function AdminNewsPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [news, setNews] = useState<NewsItem[]>(newsMock)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const handleDelete = (id: string) => {
    hapticFeedback("warning")
    setNews((prev) => prev.filter((n) => n.id !== id))
  }

  const handleSave = (newsItem: Partial<NewsItem>) => {
    hapticFeedback("success")
    if (editingNews) {
      setNews((prev) => prev.map((n) => (n.id === editingNews.id ? { ...n, ...newsItem } : n)))
    } else {
      const newNewsItem: NewsItem = {
        id: Date.now().toString(),
        title: { "uz-lat": "", "uz-cyr": "", ru: "", en: "", ...newsItem.title },
        excerpt: { "uz-lat": "", "uz-cyr": "", ru: "", en: "", ...newsItem.excerpt },
        body: { "uz-lat": "", "uz-cyr": "", ru: "", en: "", ...newsItem.body },
        mediaType: newsItem.mediaType || "text",
        publishedAt: new Date().toISOString(),
        createdBy: "admin",
      }
      setNews((prev) => [newNewsItem, ...prev])
    }
    setIsDialogOpen(false)
    setEditingNews(null)
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
      <div className="container max-w-lg mx-auto px-3 py-3 space-y-3">
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
          {news.map((item) => {
            const Icon = mediaIcons[item.mediaType]
            return (
              <Card key={item.id} className="overflow-hidden card-animate">
                <CardContent className="p-3">
                  <div className="flex gap-2.5">
                    {item.mediaUrls?.[0] ? (
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        <CloudinaryThumbnail
                          src={item.mediaUrls[0]}
                          alt={item.title[locale]}
                          width={56}
                          height={56}
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-foreground line-clamp-2">{item.title[locale]}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[10px] gap-0.5 h-4 px-1">
                          <Icon className="h-2.5 w-2.5" />
                          {t.news[item.mediaType]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(item.publishedAt), "dd.MM.yyyy")}
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
          })}
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
  onSave: (news: Partial<NewsItem>) => void
  onClose: () => void
  locale: "uz-lat" | "uz-cyr" | "ru" | "en"
  t: ReturnType<typeof useApp>["t"]
}) {
  const [activeTab, setActiveTab] = useState<"uz-lat" | "uz-cyr" | "ru" | "en">("uz-lat")
  const [mediaType, setMediaType] = useState<NewsItem["mediaType"]>(news?.mediaType || "text")
  const [mediaUrls, setMediaUrls] = useState<string[]>(news?.mediaUrls || [])
  const [titles, setTitles] = useState({
    "uz-lat": news?.title["uz-lat"] || "",
    "uz-cyr": news?.title["uz-cyr"] || "",
    ru: news?.title["ru"] || "",
    en: news?.title["en"] || "",
  })
  const [bodies, setBodies] = useState({
    "uz-lat": news?.body["uz-lat"] || "",
    "uz-cyr": news?.body["uz-cyr"] || "",
    ru: news?.body["ru"] || "",
    en: news?.body["en"] || "",
  })
  
  const handleMediaUpload = (url: string, publicId: string) => {
    setMediaUrls(prev => [...prev, url])
  }

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    onSave({
      title: titles,
      excerpt: {
        "uz-lat": bodies["uz-lat"].slice(0, 150),
        "uz-cyr": bodies["uz-cyr"].slice(0, 150),
        ru: bodies["ru"].slice(0, 150),
        en: bodies["en"].slice(0, 150),
      },
      body: bodies,
      mediaType,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    })
  }

  return (
    <DialogContent className="max-w-[90vw] sm:max-w-sm max-h-[85vh] overflow-y-auto">
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
        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.mediaType}</Label>
          <Select value={mediaType} onValueChange={(v) => setMediaType(v as NewsItem["mediaType"])}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">{t.news.photo}</SelectItem>
              <SelectItem value="video">{t.news.video}</SelectItem>
              <SelectItem value="audio">{t.news.audio}</SelectItem>
              <SelectItem value="text">{t.news.text}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mediaType !== "text" && (
          <div className="space-y-3">
            <ImageUploadButton 
              onUpload={handleMediaUpload}
              className="w-full h-auto py-4 border-2 border-dashed flex-col gap-2"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t.admin.uploadMedia}</span>
            </ImageUploadButton>
            
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <CloudinaryThumbnail
                      src={url}
                      alt={`Media ${index + 1}`}
                      width={80}
                      height={80}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="uz-lat" className="text-[10px] px-1">
              O&apos;zb
            </TabsTrigger>
            <TabsTrigger value="uz-cyr" className="text-[10px] px-1">
              Ўзб
            </TabsTrigger>
            <TabsTrigger value="ru" className="text-[10px] px-1">
              Рус
            </TabsTrigger>
            <TabsTrigger value="en" className="text-[10px] px-1">
              Eng
            </TabsTrigger>
          </TabsList>

          {(["uz-lat", "uz-cyr", "ru", "en"] as const).map((lang) => (
            <TabsContent key={lang} value={lang} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t.admin.newsTitle}</Label>
                <Input
                  value={titles[lang]}
                  onChange={(e) => setTitles((prev) => ({ ...prev, [lang]: e.target.value }))}
                  placeholder={
                    lang === "ru" ? "Заголовок новости" : lang === "en" ? "News title" : "Yangilik sarlavhasi"
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t.admin.newsBody}</Label>
                <Textarea
                  value={bodies[lang]}
                  onChange={(e) => setBodies((prev) => ({ ...prev, [lang]: e.target.value }))}
                  placeholder={
                    lang === "ru" ? "Текст новости..." : lang === "en" ? "News body..." : "Yangilik matni..."
                  }
                  rows={5}
                  className="text-sm"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="h-8 text-xs btn-animate bg-transparent">
          {t.common.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!titles["uz-lat"] && !titles["uz-cyr"] && !titles["ru"] && !titles["en"]}
          className="h-8 text-xs btn-animate"
        >
          {t.common.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
