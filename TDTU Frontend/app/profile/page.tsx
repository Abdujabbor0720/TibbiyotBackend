"use client"

import { useState } from "react"
import { useApp, type UserProfile } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CloudinaryAvatar } from "@/components/ui/cloudinary-image"
import { ImageUploadButton } from "@/components/ui/file-upload"
import { localeNames, locales, type Locale } from "@/lib/i18n/dictionaries"
import { User, Settings, Shield, ChevronDown, X, Save, Globe, Moon, Sun, Check, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { hapticFeedback } from "@/lib/telegram"

export default function ProfilePage() {
  const { locale, setLocale, theme, setTheme, isAdmin, profile, setProfile, telegramUser, t } = useApp()

  const [firstName, setFirstName] = useState(profile?.firstName || "")
  const [lastName, setLastName] = useState(profile?.lastName || "")
  const [course, setCourse] = useState(profile?.course?.toString() || "")
  const [major, setMajor] = useState(profile?.major || "")
  const [group, setGroup] = useState(profile?.group || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "")
  const [isOptionalOpen, setIsOptionalOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleAvatarUpload = (url: string, publicId: string) => {
    setAvatarUrl(url)
    hapticFeedback("success")
  }

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) return

    hapticFeedback("success")

    const newProfile: UserProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(avatarUrl && { avatarUrl }),
      ...(course && { course: Number.parseInt(course) }),
      ...(major && { major: major.trim() }),
      ...(group && { group: group.trim() }),
    }

    setProfile(newProfile)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleRemoveOptional = (field: "course" | "major" | "group") => {
    hapticFeedback("light")
    if (field === "course") setCourse("")
    if (field === "major") setMajor("")
    if (field === "group") setGroup("")
  }

  const isFormValid = firstName.trim() && lastName.trim()
  const hasChanges =
    firstName !== (profile?.firstName || "") ||
    lastName !== (profile?.lastName || "") ||
    course !== (profile?.course?.toString() || "") ||
    major !== (profile?.major || "") ||
    group !== (profile?.group || "")

  return (
    <AppLayout title={t.profile.title}>
      <div className="container max-w-lg mx-auto px-3 py-3 space-y-3">
        {/* Telegram User Card */}
        <Card className="bg-card/60 backdrop-blur-md border-border/30">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
              <User className="h-3 w-3 text-primary" />
              {t.profile.telegramUser}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {avatarUrl ? (
                  <CloudinaryAvatar
                    src={avatarUrl}
                    alt={telegramUser.first_name}
                    size={44}
                    className="ring-2 ring-primary/10"
                  />
                ) : (
                  <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                    <AvatarImage
                      src={telegramUser.photo_url || "/placeholder.svg?height=44&width=44&query=avatar"}
                      alt={telegramUser.first_name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {telegramUser.first_name.charAt(0)}
                      {telegramUser.last_name?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                )}
                <ImageUploadButton 
                  onUpload={handleAvatarUpload}
                  className="absolute -bottom-1 -right-1 h-6 w-6 p-0 rounded-full"
                >
                  <Camera className="h-3 w-3" />
                </ImageUploadButton>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] text-foreground">
                  {telegramUser.first_name} {telegramUser.last_name || ""}
                </p>
                {telegramUser.username && <p className="text-[11px] text-muted-foreground">@{telegramUser.username}</p>}
                <div className="flex gap-1 mt-0.5">
                  {telegramUser.is_premium && (
                    <Badge variant="secondary" className="text-[8px] h-3.5 px-1">
                      Premium
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="default" className="text-[8px] h-3.5 px-1">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="bg-card/60 backdrop-blur-md border-border/30">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-[11px] font-medium">{t.profile.personalInfo}</CardTitle>
            <CardDescription className="text-[9px]">{t.onboarding.required}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 px-3 pb-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-[10px]">
                {t.onboarding.firstName} *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.onboarding.firstNamePlaceholder}
                className="h-8 text-xs bg-card/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-[10px]">
                {t.onboarding.lastName} *
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.onboarding.lastNamePlaceholder}
                className="h-8 text-xs bg-card/50 backdrop-blur-sm"
              />
            </div>

            {/* Optional Fields */}
            <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen} className="pt-1">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {t.profile.optionalFieldsSection}
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1">
                      {t.onboarding.optional}
                    </Badge>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      isOptionalOpen && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="course" className="text-xs">
                      {t.onboarding.course}
                    </Label>
                    {course && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-destructive"
                        onClick={() => handleRemoveOptional("course")}
                      >
                        <X className="h-2.5 w-2.5 mr-0.5" />
                        {t.profile.removeField}
                      </Button>
                    )}
                  </div>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger id="course" className="h-9 text-sm">
                      <SelectValue placeholder={t.onboarding.selectCourse} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((c) => (
                        <SelectItem key={c} value={c.toString()}>
                          {c}-{locale === "ru" ? "курс" : locale === "en" ? "year" : "kurs"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="major" className="text-xs">
                      {t.onboarding.major}
                    </Label>
                    {major && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-destructive"
                        onClick={() => handleRemoveOptional("major")}
                      >
                        <X className="h-2.5 w-2.5 mr-0.5" />
                        {t.profile.removeField}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder={t.onboarding.enterMajor}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="group" className="text-xs">
                      {t.onboarding.group || "Guruh"}
                    </Label>
                    {group && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-destructive"
                        onClick={() => handleRemoveOptional("group")}
                      >
                        <X className="h-2.5 w-2.5 mr-0.5" />
                        {t.profile.removeField}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="group"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder={t.onboarding.enterGroup || "Guruhingizni kiriting"}
                    className="h-8 text-xs bg-card/50 backdrop-blur-sm"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Save Button - Premium Kreativ */}
            {hasChanges && (
              <Button 
                onClick={handleSave} 
                disabled={!isFormValid} 
                className="w-full gap-2 h-11 text-sm btn-animate rounded-xl shadow-lg hover:shadow-xl ring-2 ring-primary/20 transition-all duration-300"
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t.profile.saved}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t.common.save}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Settings - Premium Design */}
        <Card className="bg-card/60 backdrop-blur-md border-border/30">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              {t.profile.settings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            {/* Language */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.profile.language}</span>
              </div>
              <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                <SelectTrigger className="w-[120px] h-9 text-sm rounded-xl border-border/50 bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((l) => (
                    <SelectItem key={l} value={l} className="text-sm">
                      {localeNames[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="opacity-50" />

            {/* Theme */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">{t.profile.theme}</span>
              </div>
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                <SelectTrigger className="w-[120px] h-9 text-sm rounded-xl border-border/50 bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light" className="text-sm">
                    {t.profile.lightTheme}
                  </SelectItem>
                  <SelectItem value="dark" className="text-sm">
                    {t.profile.darkTheme}
                  </SelectItem>
                  <SelectItem value="system" className="text-sm">
                    {t.profile.systemTheme}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Note - Premium Kreativ */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              {t.profile.privacyNote}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{t.profile.privacyText}</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
