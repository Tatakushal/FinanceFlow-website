"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const partners = [
  "Chase", "Bank of America", "Wells Fargo", "Citibank", 
  "Capital One", "TD Bank", "PNC Bank", "US Bank",
  "Fidelity", "Charles Schwab", "Vanguard", "Robinhood"
]

export function Partners() {
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
    <section ref={sectionRef} className="py-16 border-y border-border/50 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className={cn(
          "text-center text-sm text-muted-foreground mb-8 opacity-0 transition-all duration-700",
          isVisible && "opacity-100"
        )}>
          Connects seamlessly with over 10,000 financial institutions
        </p>
        
        {/* Logo Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 animate-marquee">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner}-${index}`}
                className="flex-shrink-0 text-xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-default"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
