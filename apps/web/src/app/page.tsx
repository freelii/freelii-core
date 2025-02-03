"use client"

import { cn } from "@freelii/utils"
import LandingPage from "./_components/landing-page"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center relative">
      {/* Gradient background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
          "opacity-15 blur-[75px]"
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <LandingPage />
      </div>
    </main>
  )
}

