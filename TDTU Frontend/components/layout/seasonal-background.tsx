"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { getCurrentSeason, type SeasonConfig, type Season } from "@/lib/seasons"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  drift: number
  delay: number
}

// Optimal particle count for performance
const PARTICLE_COUNT = 25

const SeasonalBackgroundComponent = () => {
  const [season, setSeason] = useState<SeasonConfig | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isVisible, setIsVisible] = useState(true)

  const createParticle = useCallback((id: number, initialY?: number): Particle => {
    return {
      id,
      x: Math.random() * 100,
      y: initialY ?? Math.random() * 100,
      size: Math.random() * 12 + 8, // Bigger particles 8-20px
      speed: Math.random() * 0.8 + 0.3, // Slower for smoothness
      opacity: Math.random() * 0.4 + 0.2, // More subtle
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      drift: (Math.random() - 0.5) * 1.5,
      delay: Math.random() * 2,
    }
  }, [])

  useEffect(() => {
    const currentSeason = getCurrentSeason()
    setSeason(currentSeason)
    
    const initialParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => 
      createParticle(i, Math.random() * 100)
    )
    setParticles(initialParticles)

    // Check visibility for performance
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [createParticle])

  useEffect(() => {
    if (!season || !isVisible) return

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => {
          let newY = particle.y + particle.speed * 0.25
          let newX = particle.x + particle.drift * 0.08
          let newRotation = particle.rotation + particle.rotationSpeed * 0.5

          if (newY > 105) {
            return createParticle(particle.id, -10)
          }

          if (newX > 105) newX = -5
          if (newX < -5) newX = 105

          return {
            ...particle,
            x: newX,
            y: newY,
            rotation: newRotation,
          }
        })
      )
    }, 60) // 60ms for smooth 16fps animation

    return () => clearInterval(interval)
  }, [season, createParticle, isVisible])

  const particleContent = useMemo(() => {
    if (!season) return "✨"
    const contents: Record<Season, string[]> = {
      winter: ["❄️", "❄", "✦", "•"],
      spring: ["🌸", "🌺", "✿", "❀"],
      summer: ["☀️", "✨", "⭐", "✦"],
      autumn: ["🍂", "🍁", "🍃", "✦"],
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
      {/* Premium gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getSeasonGradient} transition-colors duration-1000`} />
      
      {/* Glassmorphism base layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-background/60 backdrop-blur-[1px]" />
      
      {/* Animated particles with CSS animations for performance */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute select-none animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg) translateZ(0)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${4 + particle.delay}s`,
            filter: season.name === "winter" 
              ? "drop-shadow(0 0 4px rgba(200,220,255,0.6))" 
              : season.name === "summer"
              ? "drop-shadow(0 0 6px rgba(255,200,100,0.5))"
              : "none",
          }}
        >
          {particleContent[particle.id % particleContent.length]}
        </div>
      ))}
      
      {/* Subtle ambient glow */}
      <div className="absolute inset-0">
        {season.name === "winter" && (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}
        {season.name === "spring" && (
          <>
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-green-300/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </>
        )}
        {season.name === "summer" && (
          <>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-yellow-200/15 to-orange-200/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl animate-pulse" />
          </>
        )}
        {season.name === "autumn" && (
          <>
            <div className="absolute top-1/3 left-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </>
        )}
      </div>
    </div>
  )
}

export const SeasonalBackground = memo(SeasonalBackgroundComponent)
