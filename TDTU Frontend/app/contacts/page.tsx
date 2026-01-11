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
import { Search, Users, MessageCircle, ExternalLink, User, ChevronLeft, ChevronRight } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"

const BOT_USERNAME = "TSDI_bot"
const ITEMS_PER_PAGE = 6

// Helper to get localized text (handles both string and Record<string, string>)
const getLocalizedText = (value: string | Record<string, string> | null | undefined, locale: string): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[locale] || value["uz-lat"] || value["en"] || Object.values(value)[0] || ""
}

export default function ContactsPage() {
  const { locale, t } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (contact.status !== "active") return false
      const searchLower = searchQuery.toLowerCase()
      const positionText = getLocalizedText(contact.position, locale)
      const departmentText = getLocalizedText(contact.department, locale)
      return (
        contact.fullName.toLowerCase().includes(searchLower) ||
        positionText.toLowerCase().includes(searchLower) ||
        departmentText.toLowerCase().includes(searchLower)
      )
    })
  }, [searchQuery, locale, contacts])

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE)
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredContacts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredContacts, currentPage])

  const handleWriteInBot = (contactId: string) => {
    hapticFeedback("light")
    window.open(`https://t.me/${BOT_USERNAME}?start=to_contact_${contactId}`, "_blank")
  }

  return (
    <AppLayout title={t.contacts.title}>
      <div className="container max-w-md mx-auto px-3 py-3 space-y-3">
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
          <>
            <div className="grid grid-cols-2 gap-2">
              {paginatedContacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden card-animate bg-card/60 backdrop-blur-md border-border/30">
                  <CardContent className="p-2.5">
                    {/* Avatar centered */}
                    <div className="flex justify-center mb-2">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20 shadow-lg">
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary/50" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Info centered */}
                    <div className="text-center space-y-0.5">
                      <h3 className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">{contact.fullName}</h3>
                      <p className="text-[10px] text-primary line-clamp-1">{getLocalizedText(contact.position, locale)}</p>
                      <Badge variant="secondary" className="text-[8px] h-3.5 px-1.5 bg-primary/5">
                        {getLocalizedText(contact.department, locale)}
                      </Badge>
                    </div>
                    {/* Actions - Compact Buttons */}
                    <div className="flex gap-1.5 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 gap-1 h-7 text-[10px] btn-animate rounded-lg"
                        onClick={() => handleWriteInBot(contact.id)}
                      >
                        <MessageCircle className="h-3 w-3" />
                        {t.contacts.writeShort || "Yozish"}
                      </Button>
                      <Link href={`/contacts/${contact.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-7 text-[10px] btn-animate border-border/50 hover:border-primary/40 rounded-lg"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-xs"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
