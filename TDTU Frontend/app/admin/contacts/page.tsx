"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { CloudinaryAvatar } from "@/components/ui/cloudinary-image"
import { ImageUploadButton } from "@/components/ui/file-upload"
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
import { contactsMock, type ContactPerson } from "@/lib/mock-data"
import { ArrowLeft, Plus, Pencil, Trash2, Users, Camera } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram"

export default function AdminContactsPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [contacts, setContacts] = useState<ContactPerson[]>(contactsMock)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const handleDelete = (id: string) => {
    hapticFeedback("warning")
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = (contact: Partial<ContactPerson>, isEdit: boolean) => {
    hapticFeedback("success")
    if (isEdit && editingContact) {
      setContacts((prev) => prev.map((c) => (c.id === editingContact.id ? { ...c, ...contact } : c)))
      setIsEditDialogOpen(false)
    } else {
      const newContact: ContactPerson = {
        id: Date.now().toString(),
        fullName: contact.fullName || "",
        telegramId: contact.telegramId || "",
        position: { "uz-lat": "", "uz-cyr": "", ru: "", en: "", ...contact.position },
        department: { "uz-lat": "", "uz-cyr": "", ru: "", en: "", ...contact.department },
        description: { "uz-lat": "", "uz-cyr": "", ru: "", en: "", ...contact.description },
        status: "active",
        createdAt: new Date().toISOString(),
      }
      setContacts((prev) => [...prev, newContact])
      setIsAddDialogOpen(false)
    }
    setEditingContact(null)
  }

  const openEditDialog = (contact: ContactPerson) => {
    setEditingContact(contact)
    setIsEditDialogOpen(true)
  }

  return (
    <AppLayout title={t.admin.manageContacts} showFooter={false}>
      <div className="container max-w-lg mx-auto px-3 py-3 space-y-3">
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
            <ContactFormDialog
              contact={null}
              onSave={(c) => handleSave(c, false)}
              onClose={() => setIsAddDialogOpen(false)}
              locale={locale}
              t={t}
            />
          </Dialog>
        </div>

        {/* Contacts List */}
        <div className="space-y-2">
          {contacts.map((contact) => (
            <Card key={contact.id} className="card-animate">
              <CardContent className="p-3">
                <div className="flex gap-2.5">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0">
                    {contact.photoUrl ? (
                      <CloudinaryAvatar
                        src={contact.photoUrl}
                        alt={contact.fullName}
                        size={40}
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                        {contact.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{contact.fullName}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{contact.position[locale]}</p>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <ContactFormDialog
            contact={editingContact}
            onSave={(c) => handleSave(c, true)}
            onClose={() => {
              setIsEditDialogOpen(false)
              setEditingContact(null)
            }}
            locale={locale}
            t={t}
          />
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
  contact: ContactPerson | null
  onSave: (contact: Partial<ContactPerson>) => void
  onClose: () => void
  locale: "uz-lat" | "uz-cyr" | "ru" | "en"
  t: ReturnType<typeof useApp>["t"]
}) {
  const [fullName, setFullName] = useState(contact?.fullName || "")
  const [telegramId, setTelegramId] = useState(contact?.telegramId || "")
  const [photoUrl, setPhotoUrl] = useState(contact?.photoUrl || "")
  const [position, setPosition] = useState(contact?.position[locale] || "")
  const [department, setDepartment] = useState(contact?.department[locale] || "")
  const [description, setDescription] = useState(contact?.description[locale] || "")

  const handlePhotoUpload = (url: string, publicId: string) => {
    setPhotoUrl(url)
  }

  const handleSubmit = () => {
    onSave({
      fullName,
      telegramId,
      photoUrl: photoUrl || undefined,
      position: { ...contact?.position, [locale]: position },
      department: { ...contact?.department, [locale]: department },
      description: { ...contact?.description, [locale]: description },
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
        <div className="flex justify-center">
          <div className="relative">
            {photoUrl ? (
              <CloudinaryAvatar
                src={photoUrl}
                alt={fullName || "Contact"}
                size={80}
                className="ring-2 ring-primary/20"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-medium text-muted-foreground">
                {fullName ? fullName.charAt(0) : "?"}
              </div>
            )}
            <ImageUploadButton 
              onUpload={handlePhotoUpload}
              className="absolute -bottom-1 -right-1 h-7 w-7 p-0 rounded-full"
            >
              <Camera className="h-3.5 w-3.5" />
            </ImageUploadButton>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.fullName}</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rahimov Aziz Karimovich"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telegram ID</Label>
          <Input
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="@username"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.contacts.position}</Label>
          <Input value={position} onChange={(e) => setPosition(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.contacts.department}</Label>
          <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.admin.description}</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="text-sm" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="h-8 text-xs btn-animate bg-transparent">
          {t.common.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={!fullName || !telegramId} className="h-8 text-xs btn-animate">
          {t.common.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
