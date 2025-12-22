"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useApp, type UserProfile } from "@/lib/store"
import { localeNames, locales, type Locale } from "@/lib/i18n/dictionaries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { hapticFeedback } from "@/lib/telegram"

type Step = "language" | "profile"

export default function OnboardingPage() {
  const router = useRouter()
  const { locale, setLocale, setProfile, completeOnboarding, t } = useApp()

  const [step, setStep] = useState<Step>("language")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [course, setCourse] = useState<string>("")
  const [major, setMajor] = useState("")
  const [age, setAge] = useState("")
  const [isOptionalOpen, setIsOptionalOpen] = useState(false)

  const availableLocales = locales.filter((l) => l !== locale)

  const handleLanguageSelect = (newLocale: Locale) => {
    hapticFeedback("selection")
    setLocale(newLocale)
  }

  const handleContinue = () => {
    hapticFeedback("light")
    setStep("profile")
  }

  const handleComplete = () => {
    if (!firstName.trim() || !lastName.trim()) return

    hapticFeedback("success")

    const profile: UserProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(course && { course: Number.parseInt(course) }),
      ...(major && { major: major.trim() }),
      ...(age && { age: Number.parseInt(age) }),
    }

    setProfile(profile)
    completeOnboarding()
    router.replace("/home")
  }

  const isFormValid = firstName.trim() && lastName.trim()

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="relative h-24 w-24 mb-4 overflow-hidden rounded-full shadow-xl ring-4 ring-blue-500/80 bg-white">
          <Image src="/images/image.png" alt="TSDI Logo" fill className="object-contain p-1" priority />
        </div>
        <h1 className="text-lg font-bold text-foreground">{t.common.appName}</h1>
        <p className="text-sm text-muted-foreground mt-1 text-center px-4">{t.common.appFullName}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 pb-6">
        {step === "language" ? (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-3 px-4 pt-4">
              <CardTitle className="text-base">{t.onboarding.welcome}</CardTitle>
              <CardDescription className="text-xs">{t.onboarding.selectLanguage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {/* Current Language */}
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
                      {locale === "uz-lat" ? "UZ" : locale === "uz-cyr" ? "ЎЗ" : locale === "en" ? "EN" : "РУ"}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{localeNames[locale]}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-0.5 text-[10px] h-5">
                    <Check className="h-2.5 w-2.5" />
                    Active
                  </Badge>
                </div>
              </div>

              {/* Other Languages - Premium Kreativ Buttons */}
              <div className="space-y-2.5">
                {availableLocales.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLanguageSelect(l)}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 btn-animate",
                      "hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                      "shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/50 text-secondary-foreground font-bold text-sm shadow-md">
                        {l === "uz-lat" ? "UZ" : l === "uz-cyr" ? "ЎЗ" : l === "en" ? "EN" : "РУ"}
                      </div>
                      <p className="font-semibold text-sm text-foreground">{localeNames[l]}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Button onClick={handleContinue} className="w-full mt-4 h-12 text-sm btn-animate rounded-2xl shadow-lg hover:shadow-xl ring-2 ring-primary/20 transition-all duration-300">
                {t.onboarding.continue}
                <ChevronRight className="h-5 w-5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-base">{t.onboarding.personalInfo}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="text-[10px] h-4">
                  {t.onboarding.required}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {/* Required Fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs">
                    {t.onboarding.firstName} *
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t.onboarding.firstNamePlaceholder}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs">
                    {t.onboarding.lastName} *
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t.onboarding.lastNamePlaceholder}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Optional Fields Collapsible */}
              <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {t.onboarding.optionalFields}
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        {t.onboarding.optional}
                      </Badge>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform",
                        isOptionalOpen && "rotate-180",
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="course" className="text-xs">
                      {t.onboarding.course}
                    </Label>
                    <Select value={course} onValueChange={setCourse}>
                      <SelectTrigger id="course" className="h-10 text-sm">
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
                    <Label htmlFor="major" className="text-xs">
                      {t.onboarding.major}
                    </Label>
                    <Input
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder={t.onboarding.enterMajor}
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-xs">
                      {t.onboarding.age}
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min={16}
                      max={99}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={t.onboarding.enterAge}
                      className="h-10 text-sm"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("language")}
                  className="flex-1 h-12 text-sm btn-animate rounded-2xl border-2 border-border/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {t.common.back}
                </Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={!isFormValid} 
                  className="flex-1 h-12 text-sm btn-animate rounded-2xl shadow-lg hover:shadow-xl ring-2 ring-primary/20 transition-all duration-300"
                >
                  {t.onboarding.complete}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-1.5 pb-4">
        <div
          className={cn("h-1.5 w-6 rounded-full transition-colors", step === "language" ? "bg-primary" : "bg-muted")}
        />
        <div
          className={cn("h-1.5 w-6 rounded-full transition-colors", step === "profile" ? "bg-primary" : "bg-muted")}
        />
      </div>
    </div>
  )
}
