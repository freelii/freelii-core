"use client"

import { FlagIcon } from "@/ui/shared/flag-icon"
import { ExpandingArrow } from "@freelii/ui"
import { cn } from "@freelii/utils"
import Image from "next/image"
import Link from "next/link"
import { Logo } from "node_modules/@freelii/ui/src/logo"
import LandingPage from "./_components/landing-page"

export default function Home() {
  return (
    <main className="min-h-screen flex bg-white text-black">
      {/* Left side */}
      <div className="flex-1 p-8 relative">
        <div className="w-[200%] h-[80%] rotate-[25deg] translate-x-[10%] translate-y-[-20%] h-full absolute top-0 left-0 bg-gradient-to-b from-white  to-transparent z-10" />

        <div className="flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="Get Started"
            width={80}
            height={80}
            className="z-50"
          />
        </div>
        {/* Grid overlay */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]",
            "bg-[size:24px_24px]"
          )}
        />

        {/* Gradient background */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
            "opacity-15 blur-[75px]"
          )}
        />

        {/* Radial fade overlay */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]"
          )}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Hero Content */}
          <div className="flex items-center flex-1">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <span className="block xl:inline bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  Smarter Banking
                </span>
                <Logo className="w-10 h-10 ml-2" />
              </h1>
              <h1 className="text-4xl font-bold mb-6">
                <span className="block xl:inline bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  for Modern Businesses
                </span>
              </h1>
              <div className="flex items-center mt-4 space-x-4 justify-between">
                <span className='text-xs text-muted-foreground flex items-center'>
                  <FlagIcon className="w-4 h-4 mr-2" currencyCode='USDC' />
                  Powered by USD Coin (USDC)
                </span>
                <Link
                  href="/demo"
                  className="group flex items-center bg-gradient-to-r from-black to-gray-700 text-white px-4 pr-8 py-2 rounded-full text-xs hover:bg-gray-800 transition-colors"
                >
                  Explore demo
                  <ExpandingArrow className="w-4 h-4" />
                </Link>
              </div>

              {/* Globe positioned below the text */}
              {/* <div className="mt-8 scale-75 origin-left">
                <Globe />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white z-10">
        <LandingPage />
      </div>
      <span className="absolute bottom-8 left-8 text-xs text-muted-foreground">
        © 2025 Freelii, LLC. All rights reserved.{' • '}
        <Link href="/terms" className="text-gray-400 hover:text-blue-400">Terms</Link>{' • '}
        <Link href="/privacy" className="text-gray-400 hover:text-blue-400">Privacy</Link>
      </span>
    </main >
  )
}

