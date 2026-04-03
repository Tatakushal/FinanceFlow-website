"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { UserPlus, Link2, BarChart3, Rocket, ArrowRight, Check } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in less than 2 minutes with just your email. No credit card required to start.",
    features: ["Email verification", "Secure password setup", "Profile customization"],
  },
  {
    icon: Link2,
    title: "Connect Accounts",
    description: "Securely link your bank accounts, credit cards, and investments with our encrypted connection.",
    features: ["10,000+ institutions", "Bank-level encryption", "Read-only access"],
  },
  {
    icon: BarChart3,
    title: "Get Insights",
    description: "Our AI analyzes your finances and provides personalized recommendations instantly.",
    features: ["Spending patterns", "Saving opportunities", "Investment advice"],
  },
  {
    icon: Rocket,
    title: "Grow Wealth",
    description: "Follow the insights, track your progress, and watch your financial health improve.",
    features: ["Goal tracking", "Progress reports", "Achievement rewards"],
  },
]

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
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

  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-20 opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Get Started in{" "}
            <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            No complicated setup. No hidden fees. Start managing your money smarter today.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index
              
              return (
                <div
                  key={step.title}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "relative p-6 rounded-2xl cursor-pointer transition-all duration-500",
                    "opacity-0 translate-x-8",
                    isVisible && "opacity-100 translate-x-0",
                    isActive 
                      ? "bg-card border border-primary/20 shadow-lg shadow-primary/5" 
                      : "hover:bg-card/50"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-4">
                    {/* Step Number */}
                    <div className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {isActive ? (
                        <Icon className="w-6 h-6" />
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-primary animate-pulse-glow" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={cn(
                        "text-lg font-semibold transition-colors duration-300",
                        isActive && "text-primary"
                      )}>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {step.description}
                      </p>
                      
                      {/* Features - Show on active */}
                      <div className={cn(
                        "grid grid-cols-1 gap-2 mt-4 overflow-hidden transition-all duration-500",
                        isActive ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        {step.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-10 top-[4.5rem] w-0.5 h-8 bg-border" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Visual Preview */}
          <div className={cn(
            "relative opacity-0 translate-y-8 transition-all duration-700 delay-300",
            isVisible && "opacity-100 translate-y-0"
          )}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Background Circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-border/50" />
                <div className="absolute w-3/4 h-3/4 rounded-full border border-border/50" />
                <div className="absolute w-1/2 h-1/2 rounded-full border border-border/50" />
              </div>

              {/* Animated Icons */}
              {steps.map((step, index) => {
                const Icon = step.icon
                const angle = (index * 90) - 45
                const isActive = activeStep === index
                
                return (
                  <div
                    key={step.title}
                    className={cn(
                      "absolute w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isActive 
                        ? "bg-primary text-primary-foreground scale-125 shadow-lg shadow-primary/30" 
                        : "bg-card border border-border text-muted-foreground"
                    )}
                    style={{
                      top: `${50 + 40 * Math.sin(angle * Math.PI / 180)}%`,
                      left: `${50 + 40 * Math.cos(angle * Math.PI / 180)}%`,
                      transform: `translate(-50%, -50%) ${isActive ? "scale(1.25)" : "scale(1)"}`,
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                )
              })}

              {/* Center Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-10 h-10 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
