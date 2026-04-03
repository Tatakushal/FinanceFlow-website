"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, X, Sparkles } from "lucide-react"

const comparisonData = [
  { feature: "AI-Powered Insights", financeFlow: true, traditional: false, spreadsheets: false },
  { feature: "Automatic Categorization", financeFlow: true, traditional: true, spreadsheets: false },
  { feature: "Real-time Bank Sync", financeFlow: true, traditional: true, spreadsheets: false },
  { feature: "Investment Tracking", financeFlow: true, traditional: false, spreadsheets: false },
  { feature: "Bill Reminders", financeFlow: true, traditional: true, spreadsheets: false },
  { feature: "Multi-Currency Support", financeFlow: true, traditional: false, spreadsheets: true },
  { feature: "Shared Accounts", financeFlow: true, traditional: false, spreadsheets: true },
  { feature: "Mobile App", financeFlow: true, traditional: true, spreadsheets: false },
  { feature: "Bank-Level Security", financeFlow: true, traditional: true, spreadsheets: false },
  { feature: "Custom Reports", financeFlow: true, traditional: false, spreadsheets: true },
]

export function Comparison() {
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
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Compare{" "}
            <span className="gradient-text">FinanceFlow</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            See how we stack up against traditional budgeting apps and spreadsheets.
          </p>
        </div>

        {/* Comparison Table */}
        <div className={cn(
          "rounded-2xl border border-border overflow-hidden opacity-0 translate-y-8 transition-all duration-700 delay-200",
          isVisible && "opacity-100 translate-y-0"
        )}>
          {/* Header */}
          <div className="grid grid-cols-4 bg-muted/50">
            <div className="p-4 text-sm font-medium text-muted-foreground">Features</div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">FinanceFlow</span>
              </div>
            </div>
            <div className="p-4 text-center text-sm font-medium text-muted-foreground">Traditional Apps</div>
            <div className="p-4 text-center text-sm font-medium text-muted-foreground">Spreadsheets</div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <div
              key={row.feature}
              className={cn(
                "grid grid-cols-4 border-t border-border hover:bg-muted/30 transition-colors",
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              )}
            >
              <div className="p-4 text-sm">{row.feature}</div>
              <div className="p-4 flex justify-center">
                {row.financeFlow ? (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-center">
                {row.traditional ? (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Check className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-center">
                {row.spreadsheets ? (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Check className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <p className={cn(
          "text-center text-sm text-muted-foreground mt-8 opacity-0 translate-y-8 transition-all duration-700 delay-400",
          isVisible && "opacity-100 translate-y-0"
        )}>
          FinanceFlow offers the most comprehensive feature set for modern money management.
        </p>
      </div>
    </section>
  )
}
