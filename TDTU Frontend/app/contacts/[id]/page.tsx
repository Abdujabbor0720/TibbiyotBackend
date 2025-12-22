"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { contactsMock } from "@/lib/mock-data"
import { ArrowLeft, MessageCircle, ExternalLink, Mail, Phone, Building2, Briefcase } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"

const BOT_USERNAME = "TDSU_bot"

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { locale, t } = useApp()

  const contact = contactsMock.find((c) => c.id === id)

  const getLocalizedText = (uzLat: string, uzCyr: string, ru: string, en: string) => {
    if (locale === "en") return en
    if (locale === "ru") return ru
    if (locale === "uz-cyr") return uzCyr
    return uzLat
  }

  if (!contact) {
    return (
      <AppLayout title={t.contacts.title}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xs text-muted-foreground">{t.contacts.noContacts}</p>
          <Button variant="link" onClick={() => router.back()} className="text-xs">
            {t.common.back}
          </Button>
        </div>
      </AppLayout>
    )
  }

  const handleWriteInBot = () => {
    hapticFeedback("light")
    window.open(`https://t.me/${BOT_USERNAME}?start=to_contact_${contact.id}`, "_blank")
  }

  const handleCall = () => {
    if (contact.phone) {
      hapticFeedback("light")
      window.open(`tel:${contact.phone}`, "_self")
    }
  }

  const handleEmail = () => {
    if (contact.email) {
      hapticFeedback("light")
      window.open(`mailto:${contact.email}`, "_self")
    }
  }

  return (
    <AppLayout title={t.contacts.title} showFooter={false}>
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

        <div className="px-3 py-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted ring-4 ring-primary/10 mb-3">
                  <Image
                    src={contact.photoUrl || "/placeholder.svg?height=80&width=80&query=person"}
                    alt={contact.fullName}
                    fill
                    className="object-cover"
                  />
                </div>

                <h1 className="text-base font-bold text-foreground">{contact.fullName}</h1>
                <p className="text-xs text-primary mt-0.5">{contact.position[locale]}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px] h-5">
                  {contact.department[locale]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {getLocalizedText("Mutaxassis haqida", "Мутахассис ҳақида", "О специалисте", "About specialist")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{contact.description[locale]}</p>
            </CardContent>
          </Card>

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
