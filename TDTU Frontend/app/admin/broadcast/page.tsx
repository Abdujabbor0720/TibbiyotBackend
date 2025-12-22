"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ArrowLeft, Send, MessageSquare, Upload, CheckCircle2 } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"
import { adminStatsMock } from "@/lib/mock-data"

type SendingState = "idle" | "sending" | "sent"

export default function AdminBroadcastPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [activeTab, setActiveTab] = useState<"uz-lat" | "uz-cyr" | "ru" | "en">("uz-lat")
  const [messages, setMessages] = useState({
    "uz-lat": "",
    "uz-cyr": "",
    ru: "",
    en: "",
  })
  const [sendingState, setSendingState] = useState<SendingState>("idle")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const handleSend = () => {
    hapticFeedback("success")
    setSendingState("sending")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setSendingState("sent")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleReset = () => {
    setSendingState("idle")
    setProgress(0)
    setMessages({ "uz-lat": "", "uz-cyr": "", ru: "", en: "" })
  }

  const hasMessage = messages["uz-lat"] || messages["uz-cyr"] || messages["ru"] || messages["en"]

  const getLocalizedText = (uzLat: string, uzCyr: string, ru: string, en: string) => {
    if (locale === "en") return en
    if (locale === "ru") return ru
    if (locale === "uz-cyr") return uzCyr
    return uzLat
  }

  return (
    <AppLayout title={t.admin.broadcast} showFooter={false}>
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

        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm text-foreground">{t.admin.broadcast}</h2>
        </div>

        {sendingState === "sent" ? (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="p-5 text-center">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">{t.admin.sent}!</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {getLocalizedText(
                  `Xabar ${adminStatsMock.totalUsers} foydalanuvchiga yuborildi`,
                  `Хабар ${adminStatsMock.totalUsers} фойдаланувчига юборилди`,
                  `Сообщение отправлено ${adminStatsMock.totalUsers} пользователям`,
                  `Message sent to ${adminStatsMock.totalUsers} users`,
                )}
              </p>
              <Button onClick={handleReset} className="h-9 text-sm btn-animate">
                {getLocalizedText("Yangi xabar", "Янги хабар", "Новое сообщение", "New message")}
              </Button>
            </CardContent>
          </Card>
        ) : sendingState === "sending" ? (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-medium text-foreground mb-3 text-center">{t.admin.sending}</h3>
              <Progress value={progress} className="h-1.5 mb-1.5" />
              <p className="text-[10px] text-muted-foreground text-center">
                {Math.round((progress / 100) * adminStatsMock.totalUsers)} / {adminStatsMock.totalUsers}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium">
                  {getLocalizedText("Xabar yozish", "Хабар ёзиш", "Составить сообщение", "Compose message")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
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
                        <Label className="text-xs">
                          {lang === "ru"
                            ? "Текст сообщения"
                            : lang === "uz-cyr"
                              ? "Хабар матни"
                              : lang === "en"
                                ? "Message text"
                                : "Xabar matni"}
                        </Label>
                        <Textarea
                          value={messages[lang]}
                          onChange={(e) => setMessages((prev) => ({ ...prev, [lang]: e.target.value }))}
                          placeholder={
                            lang === "ru"
                              ? "Введите текст сообщения..."
                              : lang === "uz-cyr"
                                ? "Хабар матнини киритинг..."
                                : lang === "en"
                                  ? "Enter message text..."
                                  : "Xabar matnini kiriting..."
                          }
                          rows={5}
                          className="text-sm"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="border-2 border-dashed rounded-lg p-3 text-center">
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">
                    {getLocalizedText(
                      "Media biriktirish (ixtiyoriy)",
                      "Медиа бириктириш (ихтиёрий)",
                      "Прикрепить медиа (необязательно)",
                      "Attach media (optional)",
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">(Demo - {t.admin.notWorking})</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <p className="text-xs text-foreground">
                  {getLocalizedText(
                    `Xabar ${adminStatsMock.totalUsers} foydalanuvchiga yuboriladi`,
                    `Хабар ${adminStatsMock.totalUsers} фойдаланувчига юборилади`,
                    `Сообщение будет отправлено ${adminStatsMock.totalUsers} пользователям`,
                    `Message will be sent to ${adminStatsMock.totalUsers} users`,
                  )}
                </p>
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
                      `Siz ${adminStatsMock.totalUsers} foydalanuvchiga xabar yubormoqchisiz. Bu amalni bekor qilib bo'lmaydi.`,
                      `Сиз ${adminStatsMock.totalUsers} фойдаланувчига хабар юбормоқчисиз. Бу амални бекор қилиб бўлмайди.`,
                      `Вы собираетесь отправить сообщение ${adminStatsMock.totalUsers} пользователям. Это действие нельзя отменить.`,
                      `You are about to send a message to ${adminStatsMock.totalUsers} users. This action cannot be undone.`,
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
