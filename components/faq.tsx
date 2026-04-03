"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "How secure is my financial data?",
    answer: "We use bank-level 256-bit SSL encryption to protect your data. We're also SOC 2 compliant and never store your bank credentials. We use read-only access through secure APIs provided by financial institutions.",
  },
  {
    question: "Which banks and institutions do you support?",
    answer: "FinanceFlow connects with over 10,000 financial institutions worldwide, including major banks, credit unions, investment platforms, and cryptocurrency exchanges. If your institution isn't listed, contact us and we'll work to add it.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. There are no cancellation fees or long-term commitments. If you cancel, you'll retain access until the end of your billing period.",
  },
  {
    question: "How does the AI-powered insights feature work?",
    answer: "Our AI analyzes your spending patterns, income, and financial goals to provide personalized recommendations. It identifies potential savings opportunities, unusual transactions, and helps optimize your budget automatically.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! We offer a 14-day free trial of our Pro plan with full access to all features. No credit card is required to start your trial. You can downgrade to our free tier at any time.",
  },
  {
    question: "Can I share my account with family members?",
    answer: "Our Business plan includes shared account features for families and teams. You can invite up to 10 members to view and collaborate on shared financial goals while keeping personal accounts private.",
  },
]

function FAQItem({ faq, index, isVisible }: { faq: typeof faqs[0]; index: number; isVisible: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={cn(
        "opacity-0 translate-y-8 transition-all duration-700",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="border-b border-border last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-6 flex items-center justify-between text-left group"
        >
          <span className="font-semibold group-hover:text-primary transition-colors pr-8">
            {faq.question}
          </span>
          <div className={cn(
            "w-8 h-8 rounded-full border border-border flex items-center justify-center flex-shrink-0 transition-all duration-300",
            isOpen && "bg-primary border-primary text-primary-foreground"
          )}>
            {isOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </div>
        </button>
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        )}>
          <p className="text-muted-foreground leading-relaxed pr-12">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
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
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Header */}
          <div className={cn(
            "opacity-0 translate-y-8 transition-all duration-700",
            isVisible && "opacity-100 translate-y-0"
          )}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Reach out to our support team.
            </p>
            <a 
              href="mailto:support@financeflow.com" 
              className="inline-flex items-center gap-2 mt-6 text-primary font-medium hover:underline"
            >
              Contact Support
              <span className="text-lg">&rarr;</span>
            </a>
          </div>

          {/* Right Column - FAQ Items */}
          <div>
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
