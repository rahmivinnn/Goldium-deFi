import type { ReactNode } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface PageLayoutProps {
  children: ReactNode
  fullWidth?: boolean
  hideFooter?: boolean
}

export default function PageLayout({ children, fullWidth = false, hideFooter = false }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className={`flex-grow ${fullWidth ? "" : "container mx-auto px-4 sm:px-6 lg:px-8"}`}>
        <div className="pt-24 pb-12">{children}</div>
      </main>

      {!hideFooter && <Footer />}
    </div>
  )
}
