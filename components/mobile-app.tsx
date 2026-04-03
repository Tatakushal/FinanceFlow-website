"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Smartphone, 
  Star,
  Apple,
  Play,
  Download,
  Sparkles,
  Bell,
  Wallet,
  PieChart
} from "lucide-react"

const appFeatures = [
  { icon: Bell, label: "Smart Notifications" },
  { icon: Wallet, label: "Quick Payments" },
  { icon: PieChart, label: "Live Analytics" },
  { icon: Sparkles, label: "AI Insights" },
]

export function MobileApp() {
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
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-muted/50 to-transparent" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Phone Mockup */}
          <div className={cn(
            "relative order-2 lg:order-1 opacity-0 translate-y-8 transition-all duration-700",
            isVisible && "opacity-100 translate-y-0"
          )}>
            <div className="relative mx-auto w-[280px] sm:w-[320px]">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl scale-90" />
              
              {/* Phone Frame */}
              <div className="relative bg-foreground rounded-[3rem] p-3 shadow-2xl">
                {/* Screen */}
                <div className="bg-background rounded-[2.4rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-8 bg-muted/50 flex items-center justify-center">
                    <div className="w-20 h-5 bg-foreground rounded-full" />
                  </div>
                  
                  {/* App Content */}
                  <div className="p-4 pb-8 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Good morning</p>
                        <p className="font-semibold">Sarah Chen</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        SC
                      </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-primary rounded-2xl p-4 text-primary-foreground">
                      <p className="text-xs opacity-80">Total Balance</p>
                      <p className="text-2xl font-bold mt-1">$24,847.50</p>
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full">+12.5% this month</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-2">
                      {["Send", "Request", "Cards", "More"].map((action) => (
                        <div key={action} className="text-center">
                          <div className="w-10 h-10 mx-auto bg-muted rounded-xl mb-1" />
                          <span className="text-[10px] text-muted-foreground">{action}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recent Transactions */}
                    <div>
                      <p className="text-xs font-medium mb-2">Recent Transactions</p>
                      <div className="space-y-2">
                        {[
                          { name: "Spotify", amount: "-$9.99", color: "bg-green-500" },
                          { name: "Amazon", amount: "-$156.00", color: "bg-amber-500" },
                          { name: "Salary", amount: "+$5,000", color: "bg-blue-500" },
                        ].map((tx) => (
                          <div key={tx.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-8 h-8 rounded-lg", tx.color)} />
                              <span className="text-xs font-medium">{tx.name}</span>
                            </div>
                            <span className={cn(
                              "text-xs font-semibold",
                              tx.amount.startsWith("+") ? "text-green-500" : "text-foreground"
                            )}>
                              {tx.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 glass rounded-xl p-3 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">AI Insight</p>
                    <p className="text-xs font-semibold">Save $120/mo</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">Bill due tomorrow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className={cn(
              "opacity-0 translate-y-8 transition-all duration-700",
              isVisible && "opacity-100 translate-y-0"
            )}>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Mobile App</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Your Finances, <br />
                <span className="gradient-text">Always in Pocket</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty leading-relaxed">
                Download our award-winning mobile app and manage your money on the go. Available for iOS and Android with all the features you love.
              </p>
            </div>

            {/* App Features */}
            <div className={cn(
              "mt-8 grid grid-cols-2 gap-4 opacity-0 translate-y-8 transition-all duration-700 delay-200",
              isVisible && "opacity-100 translate-y-0"
            )}>
              {appFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Ratings */}
            <div className={cn(
              "mt-8 flex items-center gap-6 opacity-0 translate-y-8 transition-all duration-700 delay-300",
              isVisible && "opacity-100 translate-y-0"
            )}>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div>
                <span className="font-semibold">4.9</span>
                <span className="text-muted-foreground text-sm ml-1">(50K+ reviews)</span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className={cn(
              "mt-8 flex flex-wrap gap-4 opacity-0 translate-y-8 transition-all duration-700 delay-400",
              isVisible && "opacity-100 translate-y-0"
            )}>
              <Button size="lg" className="gap-3 group bg-foreground hover:bg-foreground/90 text-background">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <span className="text-[10px] opacity-70 block leading-none">Download on the</span>
                  <span className="text-sm font-semibold leading-tight">App Store</span>
                </div>
              </Button>
              <Button size="lg" className="gap-3 group bg-foreground hover:bg-foreground/90 text-background">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <span className="text-[10px] opacity-70 block leading-none">Get it on</span>
                  <span className="text-sm font-semibold leading-tight">Google Play</span>
                </div>
              </Button>
            </div>

            {/* Download Count */}
            <p className={cn(
              "mt-6 text-sm text-muted-foreground flex items-center gap-2 opacity-0 translate-y-8 transition-all duration-700 delay-500",
              isVisible && "opacity-100 translate-y-0"
            )}>
              <Download className="w-4 h-4" />
              <span>Downloaded by <strong className="text-foreground">2M+</strong> users worldwide</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
