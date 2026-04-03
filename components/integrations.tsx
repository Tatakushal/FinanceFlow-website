"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Building2,
  CreditCard,
  Wallet,
  Banknote,
  PiggyBank,
  TrendingUp,
  Landmark,
  DollarSign,
  ArrowRight
} from "lucide-react"
import { Button } from "./ui/button"

const banks = [
  { name: "Chase", icon: Building2 },
  { name: "Bank of America", icon: Landmark },
  { name: "Wells Fargo", icon: Banknote },
  { name: "Citi", icon: CreditCard },
  { name: "Capital One", icon: Wallet },
  { name: "US Bank", icon: Building2 },
  { name: "PNC", icon: PiggyBank },
  { name: "TD Bank", icon: DollarSign },
  { name: "Ally", icon: TrendingUp },
  { name: "Discover", icon: CreditCard },
  { name: "HSBC", icon: Landmark },
  { name: "Barclays", icon: Building2 },
]

const categories = [
  { count: "10,000+", label: "Banks Supported" },
  { count: "500+", label: "Credit Unions" },
  { count: "200+", label: "Brokerages" },
  { count: "50+", label: "Crypto Exchanges" },
]

export function Integrations() {
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
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Integrations</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Connect All Your{" "}
            <span className="gradient-text">Financial Accounts</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Seamlessly link your bank accounts, credit cards, investments, and more. We support over 10,000 financial institutions worldwide.
          </p>
        </div>

        {/* Bank Logos Grid */}
        <div className={cn(
          "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-16 opacity-0 transition-all duration-700 delay-200",
          isVisible && "opacity-100"
        )}>
          {banks.map((bank, index) => {
            const Icon = bank.icon
            return (
              <div
                key={bank.name}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 cursor-pointer group opacity-0 scale-95",
                  isVisible && "opacity-100 scale-100"
                )}
                style={{ transitionDelay: `${(index + 2) * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {bank.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className={cn(
          "grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 opacity-0 translate-y-8 transition-all duration-700 delay-500",
          isVisible && "opacity-100 translate-y-0"
        )}>
          {categories.map((cat) => (
            <div key={cat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary">{cat.count}</p>
              <p className="text-sm text-muted-foreground mt-1">{cat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={cn(
          "text-center opacity-0 translate-y-8 transition-all duration-700 delay-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <Button variant="outline" size="lg" className="group">
            See All Integrations
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
