"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryAvatar } from "@/components/ui/cloudinary-image"
import { ImageUpload } from "@/components/ui/media-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogTrigger,
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
import { contactsApi } from "@/lib/api"
import { ArrowLeft, Plus, Pencil, Trash2, Users, Camera, Loader2 } from "lucide-react"
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

export default function AdminContactsPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [contacts, setContacts] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch contacts from backend (admin API for full data)
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
      return
    }
    
    const token = getAuthToken()
    if (!token) return
    
    setLoading(true)
    contactsApi.getAllAdmin(token)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setContacts(res.data)
        }
      })
      .catch((err) => console.error("Failed to load contacts:", err))
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
    
    const result = await contactsApi.delete(token, id)
    if (result.success) {
      setContacts((prev) => prev.filter((c) => c.id !== id))
      hapticFeedback("success")
    } else {
      alert("O'chirishda xatolik: " + (result.error || "Noma'lum xatolik"))
    }
  }

  const handleSave = async (contact: any, isEdit: boolean) => {
    const token = getAuthToken()
    if (!token) {
      alert("Token topilmadi. Qayta login qiling.")
      return
    }
    
    setSaving(true)
    try {
      if (isEdit && editingContact) {
        const result = await contactsApi.update(token, editingContact.id, contact)
        if (result.success) {
          // Refresh contacts list
          const refreshed = await contactsApi.getAllAdmin(token)
          if (refreshed.success && Array.isArray(refreshed.data)) {
            setContacts(refreshed.data)
          }
          setIsEditDialogOpen(false)
          hapticFeedback("success")
        } else {
          alert("Yangilashda xatolik: " + (result.error || "Noma'lum xatolik"))
        }
      } else {
        // Backend format: telegramUserId (numeric string), position/department as strings
        const result = await contactsApi.create(token, {
          fullName: contact.fullName || "",
          telegramUserId: contact.telegramUserId || "0",
          position: contact.position || undefined,
          department: contact.department || undefined,
          description: contact.description || undefined,
          photoUrl: contact.photoUrl || undefined,
        })
        if (result.success) {
          // Refresh contacts list
          const refreshed = await contactsApi.getAllAdmin(token)
          if (refreshed.success && Array.isArray(refreshed.data)) {
            setContacts(refreshed.data)
          }
          setIsAddDialogOpen(false)
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
      setEditingContact(null)
    }
  }

  const openEditDialog = (contact: ContactPerson) => {
    setEditingContact(contact)
    setIsEditDialogOpen(true)
  }

  return (
    <AppLayout title={t.admin.manageContacts} showFooter={false}>
      <div className="container max-w-md mx-auto px-3 py-3 space-y-3">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 -ml-2 h-8 text-xs btn-animate"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.common.back}
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">{t.admin.manageContacts}</h2>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 h-8 text-xs btn-animate">
                <Plus className="h-3.5 w-3.5" />
                {t.admin.addContact}
              </Button>
            </DialogTrigger>
            {isAddDialogOpen && (
              <ContactFormDialog
                key="add-contact"
                contact={null}
                onSave={(c) => handleSave(c, false)}
                onClose={() => setIsAddDialogOpen(false)}
                locale={locale}
                t={t}
              />
            )}
          </Dialog>
        </div>

        {/* Contacts List */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-xs text-muted-foreground">{t.contacts.noContacts}</p>
          </div>
        ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <Card key={contact.id} className="card-animate">
              <CardContent className="p-3">
                <div className="flex gap-2.5">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0">
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt={contact.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                        {contact.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{contact.fullName}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{getLocalizedText(contact.position, locale)}</p>
                    <Badge
                      variant={contact.status === "active" ? "default" : "secondary"}
                      className="mt-1 text-[10px] h-4 px-1"
                    >
                      {contact.status === "active" ? t.admin.active : t.admin.inactive}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 btn-animate"
                      onClick={() => openEditDialog(contact)}
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
                            onClick={() => handleDelete(contact.id)}
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
          ))}
        </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          {isEditDialogOpen && editingContact && (
            <ContactFormDialog
              key={`edit-${editingContact.id}`}
              contact={editingContact}
              onSave={(c) => handleSave(c, true)}
              onClose={() => {
                setIsEditDialogOpen(false)
                setEditingContact(null)
              }}
              locale={locale}
              t={t}
            />
          )}
        </Dialog>
      </div>
    </AppLayout>
  )
}

function ContactFormDialog({
  contact,
  onSave,
  onClose,
  locale,
  t,
}: {
  contact: any | null
  onSave: (contact: any) => void
  onClose: () => void
  locale: "uz-lat" | "uz-cyr" | "ru" | "en"
  t: ReturnType<typeof useApp>["t"]
}) {
  const [fullName, setFullName] = useState(contact?.fullName || "")
  const [telegramUserId, setTelegramUserId] = useState(contact?.telegramUserId || "")
  const [position, setPosition] = useState(contact?.position || "")
  const [department, setDepartment] = useState(contact?.department || "")
  const [description, setDescription] = useState(contact?.description || "")
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(contact?.photoUrl || undefined)

  // Reset form when contact changes (new contact = null)
  useEffect(() => {
    setFullName(contact?.fullName || "")
    setTelegramUserId(contact?.telegramUserId || "")
    setPosition(contact?.position || "")
    setDepartment(contact?.department || "")
    setDescription(contact?.description || "")
    setPhotoUrl(contact?.photoUrl || undefined)
  }, [contact])

  const handleSubmit = () => {
    onSave({
      fullName,
      telegramUserId,
      position: position || undefined,
      department: department || undefined,
      description: description || undefined,
      photoUrl: photoUrl || undefined,
    })
    onClose()
  }

  return (
    <DialogContent className="max-w-[90vw] sm:max-w-sm max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">{contact ? t.admin.editContact : t.admin.addContact}</DialogTitle>
        <DialogDescription className="text-xs">
          {locale === "en"
            ? "Fill in contact information"
            : locale === "ru"
              ? "Заполните информацию о контакте"
              : "Kontakt ma'lumotlarini kiriting"}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-3">
        {/* Photo Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            {locale === "ru" ? "Фото" : locale === "en" ? "Photo" : "Rasm"}
          </Label>
          <ImageUpload
            value={photoUrl}
            onChange={setPhotoUrl}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.fullName} *</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rahimov Aziz Karimovich"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telegram User ID * (raqam)</Label>
          <Input
            value={telegramUserId}
            onChange={(e) => setTelegramUserId(e.target.value.replace(/\D/g, ''))}
            placeholder="123456789"
            className="h-9 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">Foydalanuvchi Telegram ID raqami</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.contacts.position}</Label>
          <Input 
            value={position} 
            onChange={(e) => setPosition(e.target.value)} 
            placeholder="Direktor"
            className="h-9 text-sm" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.contacts.department}</Label>
          <Input 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)} 
            placeholder="Boshqaruv"
            className="h-9 text-sm" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.description}</Label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Qo'shimcha ma'lumot..."
            rows={3} 
            className="text-sm" 
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="h-8 text-xs btn-animate bg-transparent">
          {t.common.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={!fullName || !telegramUserId} className="h-8 text-xs btn-animate">
          {t.common.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
