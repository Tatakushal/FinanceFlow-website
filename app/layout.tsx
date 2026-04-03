import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "FinanceFlow - Smart Money Management Made Simple",
  description: "Take control of your finances with AI-powered insights, automated budgeting, and real-time tracking. Join 100,000+ users who trust FinanceFlow.",
  keywords: ["finance", "budgeting", "money management", "AI", "savings", "investment"],
  authors: [{ name: "FinanceFlow" }],
  openGraph: {
    title: "FinanceFlow - Smart Money Management Made Simple",
    description: "Take control of your finances with AI-powered insights, automated budgeting, and real-time tracking.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
