"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const stats = [
  {
    value: 100000,
    suffix: "+",
    label: "Active Users",
    description: "Trusted by users worldwide",
  },
  {
    value: 2,
    prefix: "$",
    suffix: "B+",
    label: "Assets Tracked",
    description: "Managing real wealth",
  },
  {
    value: 50,
    suffix: "M+",
    label: "Transactions",
    description: "Processed securely",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Always available",
  },
]

function AnimatedCounter({ 
  target, 
  suffix = "", 
  prefix = "",
  isVisible 
}: { 
  target: number
  suffix?: string
  prefix?: string
  isVisible: boolean
}) {
  const [count, setCount] = useState(0)

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
        setCount(Number(current.toFixed(1)))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, target])

  const displayValue = Number.isInteger(target) ? Math.floor(count) : count.toFixed(1)

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

export function Stats() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden bg-foreground text-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "text-center opacity-0 translate-y-8 transition-all duration-700",
                isVisible && "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">
                <AnimatedCounter 
                  target={stat.value} 
                  suffix={stat.suffix} 
                  prefix={stat.prefix}
                  isVisible={isVisible}
                />
              </div>
              <p className="text-lg font-semibold mt-2">{stat.label}</p>
              <p className="text-sm text-background/60 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
