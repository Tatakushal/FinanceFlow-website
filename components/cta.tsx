"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Sparkles, Check } from "lucide-react"

export function CTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={cn(
          "relative max-w-4xl mx-auto text-center opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Start your free 14-day trial today</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Ready to Take Control of{" "}
            <span className="gradient-text">Your Finances?</span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join over 100,000 users who have transformed their financial lives with FinanceFlow. 
            No credit card required to get started.
          </p>

          {/* Email Signup Form */}
          <div className={cn(
            "mt-10 max-w-md mx-auto opacity-0 translate-y-8 transition-all duration-700 delay-200",
            isVisible && "opacity-100 translate-y-0"
          )}>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                // Handle form submission
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button type="submit" size="lg" variant="glow" className="group h-12">
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </div>

          {/* Trust Points */}
          <div className={cn(
            "mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground opacity-0 translate-y-8 transition-all duration-700 delay-300",
            isVisible && "opacity-100 translate-y-0"
          )}>
            {[
              "No credit card required",
              "14-day free trial",
              "Cancel anytime",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
