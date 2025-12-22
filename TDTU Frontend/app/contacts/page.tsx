"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryAvatar } from "@/components/ui/cloudinary-image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { contactsApi } from "@/lib/api"
import { Search, Users, MessageCircle, ExternalLink, User } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"

const BOT_USERNAME = "TSDI_bot"

export default function ContactsPage() {
  const { locale, t } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    contactsApi.getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setContacts(res.data)
        } else {
          setError(res.error || t.contacts.noContacts)
        }
      })
      .catch(() => setError("API error"))
      .finally(() => setLoading(false))
  }, [])

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (contact.status !== "active") return false
      const searchLower = searchQuery.toLowerCase()
      return (
        contact.fullName.toLowerCase().includes(searchLower) ||
        contact.position[locale]?.toLowerCase().includes(searchLower) ||
        contact.department[locale]?.toLowerCase().includes(searchLower)
      )
    })
  }, [searchQuery, locale, contacts])

  const handleWriteInBot = (contactId: string) => {
    hapticFeedback("light")
    window.open(`https://t.me/${BOT_USERNAME}?start=to_contact_${contactId}`, "_blank")
  }

  return (
    <AppLayout title={t.contacts.title}>
      <div className="container max-w-lg lg:max-w-4xl mx-auto px-3 py-3 space-y-3">
        {/* Header */}
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">{t.contacts.title}</h2>
          <p className="text-[11px] text-muted-foreground">{t.contacts.subtitle}</p>
        </div>

        {/* Search - Premium Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.contacts.search}
            className="pl-10 h-10 text-sm bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-md border-border/40 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        {/* Loading/Error/Empty/Contacts List State */}
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">{t.common.loading}</div>
        ) : error ? (
          <div className="py-10 text-center text-destructive">{error}</div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-xs text-muted-foreground">{t.contacts.noContacts}</p>
          </div>
        ) : (
          <div className="grid gap-2 lg:grid-cols-2 lg:gap-3">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="overflow-hidden card-animate bg-card/60 backdrop-blur-md border-border/30">
                <CardContent className="p-2.5">
                  <div className="flex gap-2.5">
                    {/* Avatar */}
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/10">
                      {contact.photoUrl ? (
                        <CloudinaryAvatar
                          src={contact.photoUrl}
                          alt={contact.fullName}
                          size={48}
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary/50" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[13px] text-foreground line-clamp-1">{contact.fullName}</h3>
                      <p className="text-[11px] text-primary line-clamp-1">{contact.position[locale]}</p>
                      <Badge variant="secondary" className="mt-1 text-[9px] h-4 px-1.5 bg-primary/5">
                        {contact.department[locale]}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{contact.description[locale]}</p>
                  {/* Actions - Premium Kreativ Separated Buttons */}
                  <div className="flex gap-3 mt-3">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-2 h-10 text-xs btn-animate rounded-xl shadow-md hover:shadow-lg ring-1 ring-primary/20 transition-all duration-300"
                      onClick={() => handleWriteInBot(contact.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t.contacts.writeInBot}
                    </Button>
                    <Link href={`/contacts/${contact.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-card/60 to-card/40 h-10 text-xs btn-animate border-border/50 hover:border-primary/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {t.common.viewDetails}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
