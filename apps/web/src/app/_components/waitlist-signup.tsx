"use client"

import { useState, useEffect } from "react"
import { XLogo, LinkedIn, Google, Facebook, Avatar, SocialIcon, Button } from "@freelii/ui"
import { WaitlistForm } from "./waitlist-form"
import Image from "next/image"
import Link from "next/link"

export function WaitlistSignup() {
  const [waitlistCount, setWaitlistCount] = useState(0)

  useEffect(() => {
    // Simulate api call
    setTimeout(() => {
      setWaitlistCount(100)
    }, 1000)
  }, [])

  const handleSuccess = (count: number) => {
    setWaitlistCount(count + 100)
  }

  return (
    <div className="relative w-full max-w-xl mx-auto p-8 flex flex-col justify-between min-h-screen">
      <Button variant="outline" className="fixed top-4 right-4 bg-black hover:bg-gray-900 border-none text-white text-xs font-medium hover:text-gray-300 p-2 text-neutral-200 w-full px-2 rounded-xl transition-all duration-300 ease-in-out focus:outline-none w-[120px]">
        <Link href="/dashboard">
          Launch App
        </Link>
      </Button>
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-black to-gray-600">
            Make Money Move Freelii
          </h2>
        </div>
        <div>
          <p className="text-lg sm:text-xl mb-8 text-black">
            Join our waitlist to get early access to our product.
          </p>
        </div>
        <div className="w-full">
          <WaitlistForm onSuccess={handleSuccess} />
        </div>
        <div>
          <div className="flex items-center justify-center mt-8">
            <div className="flex -space-x-2 mr-4">
              <Avatar user={{ name: "JD", id: "1" }} />
              <Avatar user={{ name: "AS", id: "2" }} />
              <Avatar user={{ name: "MK", id: "3" }} />
            </div>
            <p className="text-black text-sm font-semibold">{waitlistCount}+ people on the waitlist</p>
          </div>
        </div>
      </div>
      <div className="pt-8 flex justify-center space-x-6">
        <SocialIcon
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (formerly Twitter)"
          icon={<XLogo className="w-6 h-6" />}
        />
        <SocialIcon
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          icon={<Google className="w-6 h-6" />}
        />
        <SocialIcon
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          icon={<Facebook className="w-6 h-6" />}
        />
        <SocialIcon
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          icon={<LinkedIn className="w-6 h-6" />}
        />
      </div>
    </div>
  )
}

