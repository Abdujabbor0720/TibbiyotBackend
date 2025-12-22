export type Season = "winter" | "spring" | "summer" | "autumn"

export interface SeasonConfig {
  name: Season
  startMonth: number // 1-12
  startDay: number
  backgroundClass: string
  gradientColors: string
  iconEmoji: string
}

export const seasons: SeasonConfig[] = [
  {
    name: "winter",
    startMonth: 12,
    startDay: 1,
    backgroundClass: "season-winter",
    gradientColors: "from-blue-100 via-slate-100 to-blue-200 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800",
    iconEmoji: "❄️",
  },
  {
    name: "spring",
    startMonth: 3,
    startDay: 1,
    backgroundClass: "season-spring",
    gradientColors:
      "from-green-100 via-emerald-50 to-pink-100 dark:from-green-950 dark:via-emerald-950 dark:to-slate-900",
    iconEmoji: "🌸",
  },
  {
    name: "summer",
    startMonth: 6,
    startDay: 1,
    backgroundClass: "season-summer",
    gradientColors:
      "from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-950 dark:via-orange-950 dark:to-slate-900",
    iconEmoji: "☀️",
  },
  {
    name: "autumn",
    startMonth: 9,
    startDay: 1,
    backgroundClass: "season-autumn",
    gradientColors:
      "from-orange-100 via-amber-100 to-red-100 dark:from-orange-950 dark:via-amber-950 dark:to-slate-900",
    iconEmoji: "🍂",
  },
]

export function getCurrentSeason(): SeasonConfig {
  const now = new Date()
  const month = now.getMonth() + 1 // JavaScript months are 0-indexed
  const day = now.getDate()

  // Winter: Dec 1 - Feb 28/29
  if (month === 12 || month === 1 || month === 2) {
    return seasons.find((s) => s.name === "winter")!
  }
  // Spring: Mar 1 - May 31
  if (month >= 3 && month <= 5) {
    return seasons.find((s) => s.name === "spring")!
  }
  // Summer: Jun 1 - Aug 31
  if (month >= 6 && month <= 8) {
    return seasons.find((s) => s.name === "summer")!
  }
  // Autumn: Sep 1 - Nov 30
  return seasons.find((s) => s.name === "autumn")!
}

export function getSeasonalBackground(): string {
  const season = getCurrentSeason()
  return season.gradientColors
}
