"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Newspaper, MessageSquare, Activity, ArrowRight, Loader2, CheckCircle2, XCircle, Plus, Pencil, Trash2, Send } from "lucide-react"
import { adminApi } from "@/lib/api"
import { format } from "date-fns"
import { uz, ru, enUS } from "date-fns/locale"

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// Action translations
const actionLabels: Record<string, Record<string, string>> = {
  'news.create': { 'uz-lat': "Yangilik qo'shildi", 'uz-cyr': "Янгилик қўшилди", ru: "Новость добавлена", en: "News added" },
  'news.update': { 'uz-lat': "Yangilik tahrirlandi", 'uz-cyr': "Янгилик таҳрирланди", ru: "Новость изменена", en: "News updated" },
  'news.delete': { 'uz-lat': "Yangilik o'chirildi", 'uz-cyr': "Янгилик ўчирилди", ru: "Новость удалена", en: "News deleted" },
  'contact.create': { 'uz-lat': "Kontakt qo'shildi", 'uz-cyr': "Контакт қўшилди", ru: "Контакт добавлен", en: "Contact added" },
  'contact.update': { 'uz-lat': "Kontakt tahrirlandi", 'uz-cyr': "Контакт таҳрирланди", ru: "Контакт изменён", en: "Contact updated" },
  'contact.delete': { 'uz-lat': "Kontakt o'chirildi", 'uz-cyr': "Контакт ўчирилди", ru: "Контакт удалён", en: "Contact deleted" },
  'broadcast.start': { 'uz-lat': "Xabar yuborildi", 'uz-cyr': "Хабар юборилди", ru: "Рассылка начата", en: "Broadcast started" },
  'broadcast.complete': { 'uz-lat': "Xabar tugallandi", 'uz-cyr': "Хабар тугалланди", ru: "Рассылка завершена", en: "Broadcast completed" },
  'media.upload': { 'uz-lat': "Media yuklandi", 'uz-cyr': "Медиа юкланди", ru: "Медиа загружено", en: "Media uploaded" },
  'media.delete': { 'uz-lat': "Media o'chirildi", 'uz-cyr': "Медиа ўчирилди", ru: "Медиа удалено", en: "Media deleted" },
}

// Entity type icons and colors
const entityConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  news: { icon: Newspaper, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  contact: { icon: Users, color: "text-green-500", bgColor: "bg-green-500/10" },
  broadcast: { icon: Send, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  media: { icon: MessageSquare, color: "text-purple-500", bgColor: "bg-purple-500/10" },
}

// Action icons
const actionIcons: Record<string, any> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  start: Send,
  complete: CheckCircle2,
  upload: Plus,
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalContacts: 0,
    totalNews: 0,
    totalBroadcasts: 0,
    totalMessages: 0,
    messagesToday: 0,
    broadcastSuccess: 0,
    broadcastFailure: 0,
  })
  const [activityLogs, setActivityLogs] = useState<any[]>([])

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
      return
    }

    const token = getAuthToken()
    if (!token) return

    setLoading(true)
    
    // Fetch stats and activity logs from backend
    Promise.all([
      adminApi.getStats(token),
      adminApi.getActivityLogs(token, { limit: 5 }),
    ])
      .then(([statsRes, activityRes]) => {
        console.log("Stats response:", statsRes)
        console.log("Activity response:", activityRes)
        
        if (statsRes.success && statsRes.data) {
          setStatsData(prev => ({ ...prev, ...statsRes.data }))
        }
        if (activityRes.success && activityRes.data) {
          // Backend returns { data: [...], total, limit, offset } wrapped in apiCall response
          const responseData = activityRes.data as any
          const logs = Array.isArray(responseData) ? responseData : (responseData.data || [])
          console.log("Activity logs parsed:", logs)
          setActivityLogs(logs)
        }
      })
      .catch((err) => console.error("Failed to load admin data:", err))
      .finally(() => setLoading(false))
  }, [isAdmin, router])

  if (!isAdmin) return null

  const stats = [
    {
      title: t.admin.totalUsers,
      value: statsData.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t.admin.totalContacts,
      value: statsData.totalContacts.toLocaleString(),
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t.admin.totalNews,
      value: statsData.totalNews.toLocaleString(),
      icon: Newspaper,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: locale === "ru" ? "Рассылки" : locale === "en" ? "Broadcasts" : "Xabarlar",
      value: statsData.totalBroadcasts.toLocaleString(),
      subtitle:
        locale === "ru"
          ? `Сегодня: ${statsData.messagesToday || 0}`
          : locale === "en"
            ? `Today: ${statsData.messagesToday || 0}`
            : `Bugun: ${statsData.messagesToday || 0}`,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  const adminLinks = [
    { href: "/admin/contacts", label: t.admin.manageContacts, icon: Users },
    { href: "/admin/news", label: t.admin.manageNews, icon: Newspaper },
    { href: "/admin/broadcast", label: t.admin.broadcast, icon: MessageSquare },
  ]

  return (
    <AppLayout title={t.admin.dashboard} showFooter={false}>
      <div className="container max-w-md mx-auto px-3 py-3 space-y-4">
        {/* Header */}
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-foreground">{t.admin.title}</h2>
          <Badge variant="secondary" className="text-[10px] h-4">
            Admin Mode
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat: any) => (
            <Card key={stat.title} className="card-animate bg-card/80 backdrop-blur border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.title}</p>
                    {stat.subtitle && (
                      <p className="text-[10px] text-primary">{stat.subtitle}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="space-y-3 py-2">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="card-animate bg-card/60 dark:bg-card/80 backdrop-blur border border-border/50 dark:border-border/40 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-2.5 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="flex-1 font-medium text-xs text-foreground">{link.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              {t.admin.recentActivity}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  {locale === "ru" ? "Нет активности" : locale === "en" ? "No activity yet" : "Hozircha faoliyat yo'q"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activityLogs.map((log) => {
                  // Parse action type (e.g., "news.create" -> actionType: "create", entityType: "news")
                  const [entityType, actionType] = (log.action || '').split('.')
                  const config = entityConfig[entityType] || entityConfig.news
                  const ActionIcon = actionIcons[actionType] || Plus
                  const EntityIcon = config.icon
                  
                  // Get localized action label
                  const actionLabel = actionLabels[log.action]?.[locale] || log.action
                  
                  // Determine if action was successful (delete actions show red, others green)
                  const isDestructive = actionType === 'delete'
                  
                  // Format date - show exact time
                  const dateLocale = locale === 'ru' ? ru : locale === 'en' ? enUS : uz
                  const exactTime = format(new Date(log.createdAt), "dd.MM.yyyy HH:mm", { locale: dateLocale })
                  
                  return (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40"
                    >
                      {/* Entity Icon */}
                      <div className={`h-9 w-9 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
                        <EntityIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <ActionIcon className={`h-3 w-3 ${isDestructive ? 'text-red-500' : 'text-green-500'}`} />
                          <p className="text-xs font-medium text-foreground truncate">{actionLabel}</p>
                          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-muted-foreground">
                            {log.user ? `${log.user.firstName} ${log.user.lastName || ''}`.trim() : 'System'}
                          </p>
                          {log.entityId && (
                            <span className="text-[9px] text-muted-foreground/60 font-mono">
                              #{log.entityId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                        
                        {/* Details from metadata */}
                        {log.details?.recipientCount && (
                          <p className="text-[10px] text-primary mt-0.5">
                            {locale === "ru" ? `Получателей: ${log.details.recipientCount}` : 
                             locale === "en" ? `Recipients: ${log.details.recipientCount}` : 
                             `Qabul qiluvchilar: ${log.details.recipientCount}`}
                          </p>
                        )}
                      </div>
                      
                      {/* Time */}
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{exactTime}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
