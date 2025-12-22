"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/store"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Newspaper, MessageSquare, Activity, ArrowRight } from "lucide-react"
import { adminStatsMock, activityLogMock } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAdmin, t, locale } = useApp()

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home")
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const stats = [
    {
      title: t.admin.totalUsers,
      value: adminStatsMock.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t.admin.totalContacts,
      value: adminStatsMock.totalContacts.toLocaleString(),
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t.admin.totalNews,
      value: adminStatsMock.totalNews.toLocaleString(),
      icon: Newspaper,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: t.admin.messagesToday,
      value: adminStatsMock.messagesToday.toLocaleString(),
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
      <div className="container max-w-lg mx-auto px-3 py-3 space-y-4">
        {/* Header */}
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-foreground">{t.admin.title}</h2>
          <Badge variant="secondary" className="text-[10px] h-4">
            Admin Mode
          </Badge>
        </div>

        {/* Stats Grid - Premium Design Ajratilgan */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-animate bg-card/90 backdrop-blur-xl border-2 border-border/50 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-lg ring-2 ${stat.color.replace('text-', 'ring-')}/40`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links - Premium Kreativ Ajratilgan */}
        <div className="space-y-4">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="card-animate bg-card/90 backdrop-blur-xl border-2 border-border/50 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 flex items-center justify-center shadow-lg ring-2 ring-primary/30">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="flex-1 font-bold text-base text-foreground">{link.label}</span>
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] px-3">{t.admin.action}</TableHead>
                  <TableHead className="text-[10px] text-right px-3">{t.admin.time}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogMock.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="py-2 px-3">
                      <p className="text-xs font-medium">{log.action}</p>
                      <p className="text-[10px] text-muted-foreground">{log.user}</p>
                    </TableCell>
                    <TableCell className="text-right text-[10px] text-muted-foreground py-2 px-3">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
