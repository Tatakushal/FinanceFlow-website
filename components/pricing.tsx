"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Sparkles, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "forever",
    features: [
      "Connect up to 2 accounts",
      "Basic spending insights",
      "Monthly budget overview",
      "Email support",
      "Mobile app access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious money management",
    price: "$9",
    period: "per month",
    features: [
      "Unlimited account connections",
      "AI-powered insights",
      "Custom budget categories",
      "Bill reminders & alerts",
      "Investment tracking",
      "Priority support",
      "Data export",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    description: "For teams and businesses",
    price: "$29",
    period: "per month",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared business accounts",
      "Advanced reporting",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SSO authentication",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

function PricingCard({ plan, index, isVisible }: { plan: typeof plans[0]; index: number; isVisible: boolean }) {
  return (
    <div
      className={cn(
        "opacity-0 translate-y-8 transition-all duration-700",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Card
        className={cn(
          "relative h-full transition-all duration-500 hover:shadow-xl",
          plan.popular
            ? "border-primary shadow-lg shadow-primary/10 scale-105 z-10"
            : "border-border/50 hover:border-primary/30"
        )}
      >
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="px-4 py-1 bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-2 pt-8">
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <div className="mt-4">
            <span className="text-5xl font-bold">{plan.price}</span>
            <span className="text-muted-foreground ml-2">/{plan.period}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={cn(
              "w-full group",
              plan.popular ? "bg-primary hover:bg-primary/90" : ""
            )}
            variant={plan.popular ? "glow" : "outline"}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function Pricing() {
  const [isVisible, setIsVisible] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
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
    <section ref={sectionRef} id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-12 opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            No hidden fees. No surprises. Choose the plan that fits your needs.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className={cn(
          "flex items-center justify-center gap-4 mb-12 opacity-0 translate-y-8 transition-all duration-700 delay-100",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className={cn(
            "text-sm transition-colors",
            billingPeriod === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 bg-muted rounded-full transition-colors hover:bg-muted/80"
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 bg-primary rounded-full transition-transform duration-300",
                billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn(
            "text-sm transition-colors",
            billingPeriod === "yearly" ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            Yearly
          </span>
          <Badge variant="success" className="ml-2">Save 20%</Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className={cn(
          "text-center mt-12 opacity-0 translate-y-8 transition-all duration-700 delay-500",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">30-day money-back guarantee</span>
            {" • "}No questions asked{" • "}Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
