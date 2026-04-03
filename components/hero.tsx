"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, TrendingUp, Shield, Zap } from "lucide-react"

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    const increment = target / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, target])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

function FloatingElement({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div 
      className={`absolute animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div 
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Floating Elements */}
      <FloatingElement className="top-32 left-[10%] hidden lg:block" delay={0}>
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Portfolio Growth</p>
              <p className="font-semibold text-green-600 dark:text-green-400">+24.5%</p>
            </div>
          </div>
        </div>
      </FloatingElement>

      <FloatingElement className="top-48 right-[8%] hidden lg:block" delay={1}>
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bank-Level Security</p>
              <p className="font-semibold">256-bit SSL</p>
            </div>
          </div>
        </div>
      </FloatingElement>

      <FloatingElement className="bottom-32 left-[15%] hidden lg:block" delay={2}>
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Insights</p>
              <p className="font-semibold">Real-time</p>
            </div>
          </div>
        </div>
      </FloatingElement>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:px-8 text-center">
        {/* Announcement Badge */}
        <div className="animate-fade-in mb-8">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium gap-2 cursor-pointer hover:bg-secondary/80 transition-colors">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>New: AI-Powered Investment Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="animate-slide-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance max-w-4xl mx-auto">
          <span className="block">Smart Money</span>
          <span className="block mt-2">
            Management{" "}
            <span className="gradient-text">Made Simple</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="animate-slide-up stagger-2 mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
          Take control of your finances with AI-powered insights, automated budgeting, 
          and real-time tracking. Join over 100,000 users who trust FinanceFlow.
        </p>

        {/* CTA Buttons */}
        <div className="animate-slide-up stagger-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" variant="glow" className="w-full sm:w-auto group">
            Start Free Trial
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="xl" variant="outline" className="w-full sm:w-auto group">
            <Play className="w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        {/* Social Proof */}
        <div className="animate-slide-up stagger-4 mt-16">
          <p className="text-sm text-muted-foreground mb-6">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Google", "Stripe", "Shopify", "Airbnb", "Netflix", "Spotify"].map((company) => (
              <div key={company} className="text-lg font-bold tracking-tight hover:opacity-100 transition-opacity cursor-default">
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="animate-slide-up stagger-5 mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: 100000, suffix: "+", label: "Active Users" },
            { value: 2, prefix: "$", suffix: "B+", label: "Assets Tracked" },
            { value: 4.9, suffix: "/5", label: "App Rating" },
            { value: 99.9, suffix: "%", label: "Uptime" },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
