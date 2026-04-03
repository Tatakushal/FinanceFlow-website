"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechCorp",
    image: "SC",
    content: "FinanceFlow completely transformed how I manage my finances. The AI insights helped me find $500 in monthly savings I never knew existed!",
    rating: 5,
  },
  {
    name: "Michael Johnson",
    role: "Freelance Designer",
    company: "Self-employed",
    image: "MJ",
    content: "As a freelancer, tracking irregular income was always a challenge. FinanceFlow makes it effortless with smart categorization and predictions.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Small Business Owner",
    company: "Bloom Cafe",
    image: "ER",
    content: "The business features are incredible. I can manage both personal and business finances in one place. It&apos;s saved me hours every week.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Software Engineer",
    company: "StartupXYZ",
    image: "DK",
    content: "I love the investment tracking feature. Seeing all my portfolios in one dashboard with real-time insights is a game-changer.",
    rating: 5,
  },
  {
    name: "Amanda Foster",
    role: "Financial Advisor",
    company: "WealthPro",
    image: "AF",
    content: "I recommend FinanceFlow to all my clients. The budgeting tools and goal tracking features help them stay on track with their financial plans.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Entrepreneur",
    company: "Multiple Ventures",
    image: "JW",
    content: "Managing finances across multiple businesses used to be a nightmare. FinanceFlow simplified everything and gave me clarity I never had before.",
    rating: 5,
  },
]

function TestimonialCard({ testimonial, index, isVisible }: { testimonial: typeof testimonials[0]; index: number; isVisible: boolean }) {
  return (
    <div
      className={cn(
        "opacity-0 translate-y-8 transition-all duration-700",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg group">
        <CardContent className="p-6">
          {/* Quote Icon */}
          <div className="mb-4">
            <Quote className="w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
          </div>

          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Content */}
          <p className="text-foreground leading-relaxed mb-6">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {testimonial.image}
            </div>
            <div>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section ref={sectionRef} id="testimonials" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-12 opacity-0 translate-y-8 transition-all duration-700",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Loved by{" "}
            <span className="gradient-text">100,000+ Users</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            See what our customers have to say about their experience with FinanceFlow.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className={cn(
          "flex justify-end gap-2 mb-6 opacity-0 translate-y-8 transition-all duration-700 delay-100",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Testimonials Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.name} className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start">
              <TestimonialCard testimonial={testimonial} index={index} isVisible={isVisible} />
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className={cn(
          "mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-0 translate-y-8 transition-all duration-700 delay-300",
          isVisible && "opacity-100 translate-y-0"
        )}>
          {[
            { value: "4.9/5", label: "App Store Rating" },
            { value: "100K+", label: "Happy Users" },
            { value: "50M+", label: "Transactions Tracked" },
            { value: "24/7", label: "Support Available" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
