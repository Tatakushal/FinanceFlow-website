"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  CreditCard,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Wifi
} from "lucide-react"

const transactions = [
  { icon: ShoppingBag, name: "Amazon", category: "Shopping", amount: -89.99, color: "text-orange-500" },
  { icon: Home, name: "Rent Payment", category: "Housing", amount: -1500.00, color: "text-blue-500" },
  { icon: Utensils, name: "Whole Foods", category: "Groceries", amount: -156.32, color: "text-green-500" },
  { icon: Car, name: "Uber", category: "Transport", amount: -24.50, color: "text-purple-500" },
  { icon: Wifi, name: "Netflix", category: "Subscription", amount: -15.99, color: "text-red-500" },
]

const spendingData = [
  { category: "Housing", amount: 1500, percentage: 40, color: "bg-blue-500" },
  { category: "Shopping", amount: 450, percentage: 12, color: "bg-orange-500" },
  { category: "Food", amount: 380, percentage: 10, color: "bg-green-500" },
  { category: "Transport", amount: 200, percentage: 5, color: "bg-purple-500" },
  { category: "Other", amount: 1245, percentage: 33, color: "bg-muted" },
]

export function AppPreview() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTransaction, setActiveTransaction] = useState(0)
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
      setActiveTransaction((prev) => (prev + 1) % transactions.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <div className={cn(
            "order-2 lg:order-1 opacity-0 translate-y-8 transition-all duration-700",
            isVisible && "opacity-100 translate-y-0"
          )}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Dashboard Preview</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              All Your Finances{" "}
              <span className="gradient-text">In One Place</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Get a beautiful, intuitive dashboard that shows you exactly where your money goes. 
              Track spending, set budgets, and reach your goals faster.
            </p>

            {/* Feature List */}
            <div className="mt-8 space-y-4">
              {[
                "Real-time transaction syncing",
                "Smart spending categorization",
                "Visual budget breakdowns",
                "Personalized insights & tips",
              ].map((feature, index) => (
                <div 
                  key={feature}
                  className={cn(
                    "flex items-center gap-3 opacity-0 translate-x-8 transition-all duration-500",
                    isVisible && "opacity-100 translate-x-0"
                  )}
                  style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - App Preview */}
          <div className={cn(
            "order-1 lg:order-2 opacity-0 translate-y-8 transition-all duration-700 delay-300",
            isVisible && "opacity-100 translate-y-0"
          )}>
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-3xl font-bold">$24,563.00</p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    +12.5%
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: DollarSign, label: "Income", value: "$8,420", trend: "up" },
                    { icon: CreditCard, label: "Expenses", value: "$3,775", trend: "down" },
                    { icon: PiggyBank, label: "Savings", value: "$4,645", trend: "up" },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="bg-muted/50 rounded-xl p-3">
                        <Icon className="w-5 h-5 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="font-semibold">{stat.value}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Spending Breakdown */}
                <div>
                  <p className="text-sm font-medium mb-3">Spending Breakdown</p>
                  <div className="h-4 rounded-full overflow-hidden flex">
                    {spendingData.map((item) => (
                      <div
                        key={item.category}
                        className={cn("h-full transition-all duration-500", item.color)}
                        style={{ width: `${item.percentage}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {spendingData.slice(0, 4).map((item) => (
                      <div key={item.category} className="flex items-center gap-2 text-xs">
                        <div className={cn("w-2 h-2 rounded-full", item.color)} />
                        <span className="text-muted-foreground">{item.category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <p className="text-sm font-medium mb-3">Recent Transactions</p>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((tx, index) => {
                      const Icon = tx.icon
                      const isActive = activeTransaction === index
                      return (
                        <div
                          key={tx.name}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg transition-all duration-300",
                            isActive && "bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center", tx.color)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tx.name}</p>
                              <p className="text-xs text-muted-foreground">{tx.category}</p>
                            </div>
                          </div>
                          <p className={cn(
                            "font-semibold text-sm",
                            tx.amount < 0 ? "text-red-500" : "text-green-500"
                          )}>
                            ${Math.abs(tx.amount).toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Floating Card - AI Insight */}
              <div className={cn(
                "absolute -right-4 top-8 glass rounded-xl p-4 shadow-lg max-w-[200px] opacity-0 translate-x-4 transition-all duration-700 delay-500",
                isVisible && "opacity-100 translate-x-0"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">AI Insight</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can save $230/mo by switching to annual subscriptions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
