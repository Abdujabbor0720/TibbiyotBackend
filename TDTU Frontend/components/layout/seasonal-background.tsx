"use client"

import { useEffect, useState, useMemo, memo } from "react"
import { getCurrentSeason, type SeasonConfig, type Season } from "@/lib/seasons"

interface Particle {
  id: number
  x: number
  size: number
  speed: number
  opacity: number
  delay: number
  drift: number
}

// Minimal particle count for smooth performance
const PARTICLE_COUNT = 8

const SeasonalBackgroundComponent = () => {
  const [season, setSeason] = useState<SeasonConfig | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const currentSeason = getCurrentSeason()
    setSeason(currentSeason)
    
    // Create particles once - pure CSS animation
    const initialParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 8, // 8-16px
      speed: Math.random() * 12 + 15, // 15-27s duration (slower = smoother)
      opacity: Math.random() * 0.25 + 0.1, // 0.1-0.35 (subtle)
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 30,
    }))
    setParticles(initialParticles)
  }, [])

  const particleContent = useMemo(() => {
    if (!season) return ["✨"]
    const contents: Record<Season, string[]> = {
      winter: ["❄", "❄️", "•", "✦"],
      spring: ["🌸", "✿", "❀", "•"],
      summer: ["☀️", "✨", "•", "✦"],
      autumn: ["🍂", "🍁", "🍃", "•"],
    }
    return contents[season.name]
  }, [season])

  const getSeasonGradient = useMemo(() => {
    if (!season) return ""
    const gradients: Record<Season, string> = {
      winter: "from-blue-500/5 via-cyan-500/3 to-slate-500/5",
      spring: "from-pink-500/5 via-rose-500/3 to-green-500/5",
      summer: "from-amber-500/5 via-yellow-500/3 to-orange-500/5",
      autumn: "from-orange-500/5 via-amber-500/3 to-red-500/5",
    }
    return gradients[season.name]
  }, [season])

  if (!season) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getSeasonGradient}`} />
      
      {/* Base layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-background/60" />
      
      {/* Optimized CSS-only snow animation - GPU accelerated */}
      <style>{`
        @keyframes snowfall {
          0% { 
            transform: translate3d(0, -5vh, 0); 
          }
          100% { 
            transform: translate3d(var(--drift), 105vh, 0); 
          }
        }
      `}</style>
      
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute top-0 select-none"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `snowfall ${particle.speed}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            ['--drift' as any]: `${particle.drift}px`,
            willChange: 'transform',
          }}
        >
          {particleContent[particle.id % particleContent.length]}
        </div>
      ))}
      
      {/* Subtle ambient glow - reduced for performance */}
      {season.name === "winter" && (
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-400/8 rounded-full blur-3xl" />
      )}
    </div>
  )
}

export const SeasonalBackground = memo(SeasonalBackgroundComponent)
