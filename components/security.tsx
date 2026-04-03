"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Lock, 
  Eye, 
  Fingerprint, 
  Server, 
  CheckCircle2,
  Award,
  FileCheck
} from "lucide-react"

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit AES Encryption",
    description: "Military-grade encryption for all your data at rest and in transit.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description: "Face ID and fingerprint login for maximum security on mobile devices.",
  },
  {
    icon: Eye,
    title: "Read-Only Access",
    description: "We never store your bank credentials. Read-only access means your money is always safe.",
  },
  {
    icon: Server,
    title: "SOC 2 Type II Compliant",
    description: "Independently audited security controls that meet the highest industry standards.",
  },
]

const certifications = [
  { icon: Award, label: "SOC 2 Type II" },
  { icon: Shield, label: "GDPR Compliant" },
  { icon: FileCheck, label: "PCI DSS" },
  { icon: CheckCircle2, label: "ISO 27001" },
]

export function Security() {
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
    <section ref={sectionRef} className="py-24 lg:py-32 bg-foreground text-background relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className={cn(
              "opacity-0 translate-y-8 transition-all duration-700",
              isVisible && "opacity-100 translate-y-0"
            )}>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Security First</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Your Financial Data, <br />
                <span className="text-primary">Fortress Protected</span>
              </h2>
              <p className="mt-4 text-lg text-background/70 text-pretty leading-relaxed">
                We use bank-level security measures to ensure your financial information stays private and protected. Your trust is our top priority.
              </p>
            </div>

            {/* Security Features List */}
            <div className="mt-10 space-y-6">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className={cn(
                      "flex gap-4 opacity-0 translate-x-[-20px] transition-all duration-700",
                      isVisible && "opacity-100 translate-x-0"
                    )}
                    style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-background/60 mt-1">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right - Certifications */}
          <div className={cn(
            "opacity-0 translate-y-8 transition-all duration-700 delay-300",
            isVisible && "opacity-100 translate-y-0"
          )}>
            {/* Shield Graphic */}
            <div className="relative mx-auto w-72 h-72 mb-12">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative">
                  <Shield className="w-40 h-40 text-primary" strokeWidth={1} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Certification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {certifications.map((cert, index) => {
                const Icon = cert.icon
                return (
                  <div
                    key={cert.label}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 opacity-0 scale-90",
                      isVisible && "opacity-100 scale-100"
                    )}
                    style={{ transitionDelay: `${(index + 4) * 150}ms` }}
                  >
                    <Icon className="w-8 h-8 text-primary" />
                    <span className="text-xs font-medium text-center">{cert.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Trust Statement */}
            <p className="mt-8 text-center text-sm text-background/50">
              Trusted by over 500 financial institutions worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
