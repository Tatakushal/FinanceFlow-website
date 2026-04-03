import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Partners } from "@/components/partners"
import { Features } from "@/components/features"
import { AppPreview } from "@/components/app-preview"
import { HowItWorks } from "@/components/how-it-works"
import { Stats } from "@/components/stats"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Partners />
      <Features />
      <AppPreview />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
