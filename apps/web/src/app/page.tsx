"use client"

import { FlagIcon } from "@/ui/shared/flag-icon";
import { cn } from "@freelii/utils";
import Link from "next/link";
import { useState } from "react";
import { WaitlistForm } from "./_components/waitlist-form";

const quotes = [
  {
    text: "Launch a $2000 marketing campaign for our new product. Focus on best performing channels and optimize daily.",
    channel: "slack",
    response: "Campaign structure ready: 40% Meta, 35% Google Ads, 25% LinkedIn. Will adjust based on performance.",
    responseBadge: "Smart Budget ↻"
  },
  {
    text: "Buy and send some flowers to my wife",
    channel: "whatsapp",
    response: "I found a local florist with premium roses for $75",
    confirm: "Please confirm purchase: Premium Rose Bouquet - $75",
    confirmation: "Sure, let's get it done"
  },
  {
    text: "Let's restart the Facebook ad campaign. Cap it at $500",
    channel: "slack",
    response: "✓ Campaign is ready to start. First results expected in 24h.",
    confirm: "Please confirm spending $500 on Facebook Ads campaign",
    confirmation: "Confirmed"
  },
  {
    text: "Let's anticipate my monthly contribution to mom's account",
    channel: "phone",
    response: "$500 transferred to Sarah Johnson. Recurring payment scheduled.",
    responseBadge: "Known recipient ✓"
  },
  {
    text: "Is there any ticket avilable for Linkin Park's concert in Mumbai?",
    channel: "telegram",
    response: "Found 2 tickets for Linkin Park's concert in Mumbai. Total: $180",
    confirm: "Proceed with booking 2 tickets for $180?",
    confirmation: "Something feels off, let's cancel it",
    responseBadge: "Time is running out ⚠️",
  }, {
    text: "Is there any ticket avilable for Linkin Park's concert in Mumbai?",
    channel: "telegram",
    response: "Found 2 tickets for Linkin Park's concert in Mumbai. Total: $180",
    confirm: "Proceed with booking 2 tickets for $180?",
    confirmation: "Something feels off, let's cancel it",
    responseBadge: "Time is running out ⚠️",
  },
  {
    text: "Move $100 into my savings account",
    channel: "phone",
    response: "Savings account updated. New balance: $4,700",
    responseBadge: "Known recipient ✓",
  },
  {
    text: "I need to pay John Doe $100 for the website design",
    channel: "slack",
    response: "✓ Payment sent to john@doe.com. Transaction ID: #8271"
  },
  {
    text: "Order a Pizza for the team",
    channel: "whatsapp",
    response: "✓ 3 large pizzas ordered from Domino's. Delivery in 30 mins."
  },
  {
    text: "We're out of coffee, please order some more",
    channel: "telegram",
    response: "✓ Coffee supplies ordered. Arriving tomorrow morning."
  },
  {
    text: "Schedule a cleaning service for the office next week",
    channel: "slack",
    response: "✓ Cleaning service booked for next Tuesday. Paid $150 from office budget."
  },
  {
    text: "Renew our Adobe Creative Cloud subscription",
    channel: "telegram",
    response: "✓ Subscription renewed for 12 months. $599.88 charged to company card."
  },
  {
    text: "Pay the quarterly AWS cloud hosting bill",
    channel: "slack",
    response: "✓ Invoice paid. $3,450 transferred to AWS. New billing cycle starts tomorrow."
  },

];

const sendPaymentSteps = [
  {
    title: "AI Agent Initiates Payment",
    description: "Your AI agent triggers secure payments to verified recipients and other agents.",
    badge: "",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17.5C14.2091 17.5 16 15.7091 16 13.5C16 11.2909 14.2091 9.5 12 9.5C9.79086 9.5 8 11.2909 8 13.5C8 15.7091 9.79086 17.5 12 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Customizable Controls",
    description: "Set flexible approval rules based on amount, recipient, frequency, or any custom logic you define.",
    badge: "",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.41003 22C3.41003 18.13 7.26003 15 12 15C12.96 15 13.89 15.13 14.76 15.37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 18C22 18.75 21.79 19.46 21.42 20.06C21.21 20.42 20.94 20.74 20.63 21C19.93 21.63 19.01 22 18 22C16.54 22 15.27 21.22 14.58 20.06C14.21 19.46 14 18.75 14 18C14 16.74 14.58 15.61 15.5 14.88C16.19 14.33 17.06 14 18 14C20.21 14 22 15.79 22 18Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.44 18L17.43 18.99L19.56 17.02" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Secure Transfer",
    description: "Instant execution with real-time confirmation and transaction verification.",
    badge: "",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.28 13.61C15.15 14.74 13.53 15.09 12.1 14.64L9.51001 17.22C9.33001 17.41 8.96001 17.53 8.69001 17.49L7.49001 17.33C7.09001 17.28 6.73001 16.9 6.67001 16.51L6.51001 15.31C6.47001 15.05 6.60001 14.68 6.78001 14.49L9.36001 11.91C8.92001 10.48 9.26001 8.86001 10.39 7.73001C12.01 6.11001 14.65 6.11001 16.28 7.73001C17.9 9.34001 17.9 11.98 16.28 13.61Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Fee-Free Micropayments",
    description: "Execute small transactions without transaction fees, perfect for A2A payments.",
    badge: "Agent-to-Agent",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 14.5L12 8L15.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

const receiveHoldSteps = [
  {
    title: "Direct Wallet Payments",
    description: "AI agents receive payments directly to their secure wallets, enabling instant no-fee micropayments as small as $0.001 ¢.",
    badge: "Micro",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17.5C14.2091 17.5 16 15.7091 16 13.5C16 11.2909 14.2091 9.5 12 9.5C9.79086 9.5 8 11.2909 8 13.5C8 15.7091 9.79086 17.5 12 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Autonomous Agent Earnings",
    description: "Enable your AI agents to autonomously collect payments for their work.",
    badge: "Agent-to-Agent",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 15.5L12 9L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Secure Wallet",
    description: "Funds are held in a secure wallet with real-time balance updates.",
    badge: "",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.33008 14.49L9.71008 11.4C10.0501 10.96 10.6801 10.88 11.1201 11.22L12.9501 12.66C13.3901 13 14.0201 12.92 14.3601 12.49L16.6701 9.51001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Automated Actions",
    description: "Get instant webhook notifications when funds arrive or transactions occur.",
    badge: "",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 12H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 15L15.5 12L12.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
];

export default function Home() {
  const [hasSubmittedWaitlist, setHasSubmittedWaitlist] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-white text-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Grid overlay */}
        <div className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]",
          "bg-[size:32px_32px]"
        )} />

        {/* Refined gradient background */}
        <div className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(ellipse_800px_600px_at_50%_-100px,rgba(120,119,198,0.15),transparent)]"
        )} />

        {/* Subtle color accent */}
        <div className={cn(
          "pointer-events-none absolute top-0 right-0 w-96 h-96",
          "bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-30"
        )} />
      </div>

      {/* Trust indicators */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 pt-6">
        <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Powered by Stellar Network</span>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center p-8 mt-4 relative z-10">
        {/* Left column - Main content */}
        <div className="space-y-8">
          <div className="space-y-6">
            {/* Hero section with better hierarchy */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Early Access
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Smarter Business
                </span>
                <span className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Banking
                </span>
              </h1>

              <div className="relative">
                <h2 className="text-2xl lg:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-[#4ab3e8] to-[#63c6f5] bg-clip-text text-transparent">
                    —For Modern Businesses
                  </span>
                </h2>
                <div className="absolute -bottom-1 left-0 w-20 h-0.5 bg-gradient-to-r from-[#4ab3e8] to-[#63c6f5] animate-[expand_1s_ease-out]"></div>
              </div>
            </div>

            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              Streamlined payments.{" "}
              <span className="font-medium text-gray-800">
                Global reach. Instant settlements.
              </span>
            </p>

            {/* USDC badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-xs text-gray-600">Powered by</span>
              <FlagIcon currencyCode="USDC-Hardcoded" />
              <span className="text-xs font-medium text-gray-800">USDC</span>
            </div>

            {/* Dashboard button for existing users */}
            <div className="flex items-center gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors duration-200"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10,17 15,12 10,7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In
              </Link>
              <span className="text-xs text-gray-400">Already have an account?</span>
            </div>
          </div>

          {/* Enhanced features section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
            <div className="group p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs leading-relaxed">Fast Transactions</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Settle payments in seconds</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 group-hover:bg-green-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs leading-relaxed">Stable Value</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">1 USDC = 1 USD, always</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 group-hover:bg-purple-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs leading-relaxed">Enterprise Security</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Bank-grade protection</p>
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 group-hover:bg-amber-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs leading-relaxed">Global Access</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Borderless transactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success message */}
          {hasSubmittedWaitlist && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-xs text-green-800 font-medium">Thank you for joining the waitlist! We&apos;ll be in touch soon.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Enhanced waitlist form */}
        <div className="relative">
          {/* Subtle background decoration */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
          <WaitlistForm onSuccess={() => {
            setHasSubmittedWaitlist(true)
          }} />
        </div>
      </div>

      {/* Enhanced footer */}
      <div className="relative z-10 mt-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>© 2025 Freelii Tech, Inc.</span>
              <div className="hidden sm:block w-px h-3 bg-gray-300"></div>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes expand {
          from { width: 0; }
          to { width: 5rem; }
        }
      `}</style>
    </main>
  )
}

