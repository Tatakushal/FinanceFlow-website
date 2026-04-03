"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  Brain, 
  PieChart, 
  Bell, 
  Lock, 
  Smartphone, 
  TrendingUp,
  Wallet,
  CreditCard,
  Target,
  LineChart,
  Users,
  Globe
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized financial recommendations powered by advanced machine learning algorithms.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: PieChart,
    title: "Smart Budgeting",
    description: "Automatically categorize expenses and create intelligent budgets that adapt to your lifestyle.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Stay informed with instant notifications for unusual spending, bill reminders, and savings goals.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "Your data is protected with 256-bit encryption, biometric authentication, and SOC 2 compliance.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Sync",
    description: "Access your finances anywhere with seamless sync across web, iOS, and Android devices.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: TrendingUp,
    title: "Investment Tracking",
    description: "Monitor all your investments in one place with real-time market data and portfolio analytics.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
]

const additionalFeatures = [
  { icon: Wallet, label: "Multi-Currency" },
  { icon: CreditCard, label: "Card Management" },
  { icon: Target, label: "Goal Setting" },
  { icon: LineChart, label: "Reports" },
  { icon: Users, label: "Shared Accounts" },
  { icon: Globe, label: "Global Access" },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const Icon = feature.icon

  return (
    <div
      ref={ref}
      className={cn(
        "opacity-0 translate-y-8 transition-all duration-700 ease-out",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="group h-full border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110", feature.bgColor)}>
            <Icon className={cn("w-7 h-7", feature.color)} />
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function Features() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Everything You Need to{" "}
            <span className="gradient-text">Master Your Finances</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Powerful tools designed to help you track, manage, and grow your wealth with confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Additional Features Bar */}
        <div className={cn(
          "mt-16 flex flex-wrap items-center justify-center gap-6 opacity-0 translate-y-8 transition-all duration-700 delay-500",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-sm text-muted-foreground">Also includes:</span>
          {additionalFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.label}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default"
              >
                <Icon className="w-4 h-4" />
                <span>{feature.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
