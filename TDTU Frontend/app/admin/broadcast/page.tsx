"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { MediaUpload } from "@/components/ui/media-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
import { ArrowLeft, Send, MessageSquare, CheckCircle2, Loader2, XCircle, Users } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"
import { adminApi } from "@/lib/api"

type SendingState = "idle" | "sending" | "sent" | "error"

interface UploadedMedia {
  id: string;
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'audio' | 'file';
  name: string;
  size: number;
}

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export default function AdminBroadcastPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [message, setMessage] = useState("")
  const [mediaFiles, setMediaFiles] = useState<UploadedMedia[]>([])
  const [sendingState, setSendingState] = useState<SendingState>("idle")
  const [broadcastResult, setBroadcastResult] = useState<{
    id: string;
    status: string;
    totalRecipients: number;
    successCount: number;
    failureCount: number;
  } | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
      return
    }
    
    // Fetch total users count
    const token = getAuthToken()
    if (token) {
      adminApi.getStats(token).then(res => {
        if (res.success && res.data) {
          setTotalUsers(res.data.totalUsers)
        }
      })
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const handleSend = async () => {
    hapticFeedback("success")
    setSendingState("sending")
    setError(null)
    
    const token = getAuthToken()
    if (!token) {
      setError("Token topilmadi. Qayta login qiling.")
      setSendingState("error")
      return
    }
    
    try {
      // Send same message to all users (admin writes in preferred language)
      const result = await adminApi.sendBroadcast(token, {
        messageUzLat: message,
        messageUzCyr: message,
        messageRu: message,
        messageEn: message,
        message: message,
        mediaUrls: mediaFiles.map(f => f.url),
      })
      
      if (result.success && result.data) {
        setBroadcastResult({
          id: result.data.id,
          status: result.data.status,
          totalRecipients: totalUsers,
          successCount: 0,
          failureCount: 0,
        })
        setSendingState("sent")
        hapticFeedback("success")
        
        // Poll for status updates
        pollBroadcastStatus(result.data.id, token)
      } else {
        setError(result.error || "Xabar yuborishda xatolik")
        setSendingState("error")
      }
    } catch (err) {
      console.error("Broadcast error:", err)
      setError("Xabar yuborishda xatolik yuz berdi")
      setSendingState("error")
    }
  }
  
  const pollBroadcastStatus = async (broadcastId: string, token: string) => {
    // Poll every 2 seconds for 30 seconds max
    let attempts = 0
    const maxAttempts = 15
    
    const poll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/broadcast/${broadcastId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        
        if (data.success && data.data) {
          setBroadcastResult(prev => prev ? {
            ...prev,
            status: data.data.status,
            successCount: data.data.successCount || 0,
            failureCount: data.data.failureCount || 0,
          } : null)
          
          // Continue polling if still processing
          if (data.data.status === 'processing' || data.data.status === 'pending') {
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 2000)
            }
          }
        }
      } catch (err) {
        console.error("Poll error:", err)
      }
    }
    
    setTimeout(poll, 2000)
  }

  const handleReset = () => {
    setSendingState("idle")
    setBroadcastResult(null)
    setMessage("")
    setMediaFiles([])
    setError(null)
  }

  const hasMessage = message.trim().length > 0

  const getLocalizedText = (uzLat: string, uzCyr: string, ru: string, en: string) => {
    if (locale === "en") return en
    if (locale === "ru") return ru
    if (locale === "uz-cyr") return uzCyr
    return uzLat
  }

  return (
    <AppLayout title={t.admin.broadcast} showFooter={false}>
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

        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm text-foreground">{t.admin.broadcast}</h2>
        </div>

        {sendingState === "sent" && broadcastResult ? (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="p-5 text-center">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">{t.admin.sent}!</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {getLocalizedText(
                  `Xabar ${broadcastResult.totalRecipients} foydalanuvchiga yuborilmoqda`,
                  `Хабар ${broadcastResult.totalRecipients} фойдаланувчига юборилмоқда`,
                  `Сообщение отправляется ${broadcastResult.totalRecipients} пользователям`,
                  `Message is being sent to ${broadcastResult.totalRecipients} users`,
                )}
              </p>
              
              {/* Status info */}
              <div className="flex items-center justify-center gap-4 text-xs mb-3">
                <span className="text-green-600">✓ {broadcastResult.successCount}</span>
                {broadcastResult.failureCount > 0 && (
                  <span className="text-red-500">✗ {broadcastResult.failureCount}</span>
                )}
                <span className="text-muted-foreground capitalize">{broadcastResult.status}</span>
              </div>
              
              <Button onClick={handleReset} className="h-9 text-sm btn-animate">
                {getLocalizedText("Yangi xabar", "Янги хабар", "Новое сообщение", "New message")}
              </Button>
            </CardContent>
          </Card>
        ) : sendingState === "error" ? (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-5 text-center">
              <XCircle className="h-14 w-14 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                {getLocalizedText("Xatolik", "Хатолик", "Ошибка", "Error")}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <Button onClick={handleReset} className="h-9 text-sm btn-animate">
                {getLocalizedText("Qayta urinish", "Қайта уриниш", "Попробовать снова", "Try again")}
              </Button>
            </CardContent>
          </Card>
        ) : sendingState === "sending" ? (
          <Card>
            <CardContent className="p-5 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
              <h3 className="text-xs font-medium text-foreground mb-2">{t.admin.sending}</h3>
              <p className="text-[10px] text-muted-foreground">
                {getLocalizedText(
                  "Iltimos kuting...",
                  "Илтимос кутинг...",
                  "Пожалуйста, подождите...",
                  "Please wait..."
                )}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* User count info */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-foreground">
                  {getLocalizedText(
                    `Xabar ${totalUsers} foydalanuvchiga yuboriladi`,
                    `Хабар ${totalUsers} фойдаланувчига юборилади`,
                    `Сообщение будет отправлено ${totalUsers} пользователям`,
                    `Message will be sent to ${totalUsers} users`,
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium">
                  {getLocalizedText("Xabar yozish", "Хабар ёзиш", "Составить сообщение", "Compose message")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                {/* Message textarea - single language */}
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {getLocalizedText("Xabar matni", "Хабар матни", "Текст сообщения", "Message text")}
                  </Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={getLocalizedText(
                      "Xabar matnini kiriting...",
                      "Хабар матнини киритинг...",
                      "Введите текст сообщения...",
                      "Enter message text..."
                    )}
                    rows={4}
                    className="text-sm"
                  />
                </div>

                {/* Media Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {getLocalizedText(
                      "Media biriktirish (ixtiyoriy)",
                      "Медиа бириктириш (ихтиёрий)",
                      "Прикрепить медиа (необязательно)",
                      "Attach media (optional)",
                    )}
                  </Label>
                  <MediaUpload
                    value={mediaFiles}
                    onChange={setMediaFiles}
                    accept="all"
                    multiple={true}
                    maxFiles={10}
                    maxSize={50}
                  />
                </div>
              </CardContent>
            </Card>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full gap-1.5 h-10 text-sm btn-animate" disabled={!hasMessage}>
                  <Send className="h-4 w-4" />
                  {t.admin.sendBroadcast}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sm">{t.admin.confirmBroadcast}</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    {getLocalizedText(
                      `Siz ${totalUsers} foydalanuvchiga xabar yubormoqchisiz. Bu amalni bekor qilib bo'lmaydi.`,
                      `Сиз ${totalUsers} фойдаланувчига хабар юбормоқчисиз. Бу амални бекор қилиб бўлмайди.`,
                      `Вы собираетесь отправить сообщение ${totalUsers} пользователям. Это действие нельзя отменить.`,
                      `You are about to send a message to ${totalUsers} users. This action cannot be undone.`,
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-8 text-xs">{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSend} className="h-8 text-xs">
                    {t.common.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </AppLayout>
  )
}
