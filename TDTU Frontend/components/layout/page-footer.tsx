"use client"

import { useApp } from "@/lib/store"
import { universityInfo } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Clock, Globe, HelpCircle, GraduationCap, ExternalLink, Heart } from "lucide-react"
import Image from "next/image"
import { getCurrentSeason } from "@/lib/seasons"

export function PageFooter() {
  const { t, locale } = useApp()
  const season = getCurrentSeason()

  const openMap = () => {
    const { lat, lng } = universityInfo.coordinates
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17`, "_blank")
  }

  const openWebsite = () => {
    window.open(universityInfo.website, "_blank")
  }

  const callHelpline = () => {
    window.open(`tel:${universityInfo.helpline}`, "_self")
  }

  const sendEmail = () => {
    window.open(`mailto:${universityInfo.email}`, "_self")
  }

  const getSeasonEmoji = () => {
    switch (season.name) {
      case "winter": return "❄️"
      case "spring": return "🌸"
      case "summer": return "☀️"
      case "autumn": return "🍂"
      default: return "✨"
    }
  }

  const getSeasonGreeting = () => {
    const greetings = {
      winter: {
        "uz-lat": "Qishki kayfiyat bilan!",
        "uz-cyr": "Қишки кайфият билан!",
        ru: "С зимним настроением!",
        en: "With winter vibes!"
      },
      spring: {
        "uz-lat": "Bahorgi ilhom bilan!",
        "uz-cyr": "Баҳорги илҳом билан!",
        ru: "С весенним вдохновением!",
        en: "With spring inspiration!"
      },
      summer: {
        "uz-lat": "Yozgi quyosh bilan!",
        "uz-cyr": "Ёзги қуёш билан!",
        ru: "С летним солнцем!",
        en: "With summer sunshine!"
      },
      autumn: {
        "uz-lat": "Kuzgi romantika bilan!",
        "uz-cyr": "Кузги романтика билан!",
        ru: "С осенней романтикой!",
        en: "With autumn romance!"
      }
    }
    return greetings[season.name][locale]
  }

  return (
    <footer className="mt-auto border-t border-border/20 bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-2xl pt-5 pb-24">
      <div className="container max-w-md mx-auto px-4 space-y-4">
        {/* University Header with Logo - Professional Full Circle */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full shadow-xl ring-[3px] ring-blue-500/80 hover:ring-blue-600 transition-all duration-500 bg-white">
            <Image 
              src="/images/logo.png" 
              alt="TDTU Logo" 
              fill 
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">{t.common.appFullName}</h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              {locale === "en" ? "Since 1958" : locale === "ru" ? "С 1958 года" : "1958 yildan beri"}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.footer.universityInfo}</h4>
          <div className="grid gap-2">
            <button
              onClick={sendEmail}
              className="flex items-center gap-3 text-xs text-muted-foreground hover:text-primary transition-all duration-300 text-left p-2 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20"
            >
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>{universityInfo.email}</span>
            </button>
            <button
              onClick={callHelpline}
              className="flex items-center gap-3 text-xs text-muted-foreground hover:text-primary transition-all duration-300 text-left p-2 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20"
            >
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>{universityInfo.helpline}</span>
            </button>
            <div className="flex items-start gap-3 text-xs text-muted-foreground p-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{universityInfo.address[locale]}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground p-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{universityInfo.workingHours} ({locale === "en" ? "Mon-Fri" : locale === "ru" ? "Пн-Пт" : "Du-Ju"})</span>
            </div>
          </div>
        </div>

        {/* Quick Links - Beautiful Separated Buttons */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.footer.quickLinks}</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 px-4 text-xs rounded-2xl bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-md hover:from-primary/15 hover:to-primary/5 border-border/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={openWebsite}
            >
              <Globe className="h-4 w-4" />
              {t.footer.website}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 px-4 text-xs rounded-2xl bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-md hover:from-primary/15 hover:to-primary/5 border-border/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={openWebsite}
            >
              <GraduationCap className="h-4 w-4" />
              {t.footer.admissions}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 px-4 text-xs rounded-2xl bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-md hover:from-primary/15 hover:to-primary/5 border-border/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={callHelpline}
            >
              <HelpCircle className="h-4 w-4" />
              {t.footer.help}
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.footer.location}</h4>
          <Card className="overflow-hidden shadow-lg border-border/30 bg-background/40 backdrop-blur-md rounded-2xl">
            <div className="relative h-28 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.5!2d69.279167!3d41.311389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b5f1d9f6e9d%3A0x1c3c5c6b7a8e9f0d!2sTashkent%20State%20Dental%20Institute!5e0!3m2!1sen!2s!4v1703123456789"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
            <CardContent className="p-2 bg-background/70 backdrop-blur-md">
              <Button
                variant="default"
                size="sm"
                className="w-full gap-2 h-9 text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                onClick={openMap}
              >
                <MapPin className="h-4 w-4" />
                {t.footer.openInMaps}
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emotional Footer - Ultra Premium Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background/60 to-primary/5 backdrop-blur-2xl border border-primary/20 p-4 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="relative flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg drop-shadow-md">{getSeasonEmoji()}</span>
              <span className="text-muted-foreground font-semibold">{getSeasonGreeting()}</span>
              <span className="text-lg drop-shadow-md">{getSeasonEmoji()}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse drop-shadow-sm" />
              <span>for</span>
              <span className="font-bold text-primary">{t.common.appName}</span>
            </div>

            <p className="text-[9px] text-muted-foreground/50">
              © {new Date().getFullYear()} {t.common.appFullName}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
