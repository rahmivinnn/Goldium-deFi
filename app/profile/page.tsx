"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProfileContent from "@/components/profile/ProfileContent"

export default function ProfilePage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <ProfileContent />
      </div>
      <Footer />
    </main>
  )
}
