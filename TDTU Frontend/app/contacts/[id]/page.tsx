"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { contactsApi } from "@/lib/api"
import { ArrowLeft, MessageCircle, ExternalLink, Mail, Phone, Building2, Briefcase, User } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"

const BOT_USERNAME = "TDSU_bot"

// Helper to get localized text
const getLocalizedText = (value: string | Record<string, string> | null | undefined, locale: string): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[locale] || value["uz-lat"] || value["en"] || Object.values(value)[0] || ""
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { locale, t } = useApp()
  const [contact, setContact] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    contactsApi.getById(id)
      .then((res) => {
        if (res.success && res.data) {
          setContact(res.data)
        } else {
          setError(res.error || t.contacts.noContacts)
        }
      })
      .catch(() => setError("API error"))
      .finally(() => setLoading(false))
  }, [id])

  const handleWriteInBot = () => {
    if (contact) {
      hapticFeedback("light")
      window.open(`https://t.me/${BOT_USERNAME}?start=to_contact_${contact.id}`, "_blank")
    }
  }

  const handleCall = () => {
    if (contact?.phone) {
      hapticFeedback("light")
      window.open(`tel:${contact.phone}`, "_self")
    }
  }

  const handleEmail = () => {
    if (contact?.email) {
      hapticFeedback("light")
      window.open(`mailto:${contact.email}`, "_self")
    }
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout title={t.contacts.title} showFooter={false}>
        <div className="container max-w-md mx-auto px-3">
          <div className="sticky top-12 z-40 bg-background/95 backdrop-blur py-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 h-8 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.common.back}
            </Button>
          </div>
          <div className="px-3 py-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-3" />
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error or no contact
  if (error || !contact) {
    return (
      <AppLayout title={t.contacts.title}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xs text-muted-foreground">{error || t.contacts.noContacts}</p>
          <Button variant="link" onClick={() => router.back()} className="text-xs">
            {t.common.back}
          </Button>
        </div>
      </AppLayout>
    )
  }

  const positionText = getLocalizedText(contact.position, locale)
  const departmentText = getLocalizedText(contact.department, locale)
  const descriptionText = getLocalizedText(contact.description, locale)

  return (
    <AppLayout title={t.contacts.title} showFooter={false}>
      <div className="container max-w-md mx-auto px-3">
        <div className="sticky top-12 z-40 bg-background/95 backdrop-blur py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 h-8 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.common.back}
          </Button>
        </div>

        <div className="py-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted ring-4 ring-primary/10 mb-3">
                  {contact.photoUrl ? (
                    <img
                      src={contact.photoUrl}
                      alt={contact.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary/50" />
                    </div>
                  )}
                </div>

                <h1 className="text-base font-bold text-foreground">{contact.fullName}</h1>
                {positionText && <p className="text-xs text-primary mt-0.5">{positionText}</p>}
                {departmentText && (
                  <Badge variant="secondary" className="mt-1.5 text-[10px] h-5">
                    {departmentText}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {descriptionText && (
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  {locale === "en" ? "About specialist" : locale === "ru" ? "О специалисте" : locale === "uz-cyr" ? "Мутахассис ҳақида" : "Mutaxassis haqida"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{descriptionText}</p>
              </CardContent>
            </Card>
          )}

          {(contact.email || contact.phone) && (
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {t.footer.contact}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3">
                {contact.email && (
                  <button
                    onClick={handleEmail}
                    className="flex items-center gap-2.5 text-xs hover:text-primary transition-colors w-full text-left btn-animate p-1.5 -m-1.5 rounded-lg"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{contact.email}</span>
                  </button>
                )}
                {contact.phone && (
                  <button
                    onClick={handleCall}
                    className="flex items-center gap-2.5 text-xs hover:text-primary transition-colors w-full text-left btn-animate p-1.5 -m-1.5 rounded-lg"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{contact.phone}</span>
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          <Button variant="default" className="w-full gap-1.5 h-10 text-sm btn-animate" onClick={handleWriteInBot}>
            <MessageCircle className="h-4 w-4" />
            {t.contacts.writeInBot}
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">{t.profile.privacyText}</p>
        </div>
      </div>
    </AppLayout>
  )
}
