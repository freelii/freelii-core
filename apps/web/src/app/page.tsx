"use client"

import { cn } from "@freelii/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitlistButton } from "./_components/waitlist-button";
import { WaitlistForm } from "./_components/waitlist-form";

const quotes = [
  {
    text: "Let's restart the Facebook ad campaign. Cap it at $500",
    channel: "slack",
    response: "✓ Campaign restarted. Budget set to $500. First results expected in 24h."
  },
  {
    text: "Buy and send some flowers to my wife",
    channel: "whatsapp",
    response: "✓ Order placed with local florist. Roses will be delivered by 2pm today."
  },
  {
    text: "Let's secure those tickets for the concert",
    channel: "telegram",
    response: "✓ 2 VIP tickets purchased. Total: $180. Check your email for confirmation."
  },
  {
    text: "Move $100 into my savings account",
    channel: "phone",
    response: "✓ Transfer complete. New savings balance: $2,450"
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
    description: "AI agents receive payments directly to their secure wallets, enabling instant no-fee micropayments as small as $0.01 cents.",
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
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [hasSubmittedWaitlist, setHasSubmittedWaitlist] = useState(false);

  // Effect for quote rotation and response animation
  useEffect(() => {
    // Reset response state when quote changes
    setShowResponse(false);

    // Show response after a delay
    const responseTimer = setTimeout(() => {
      setShowResponse(true);
    }, 1000); // 1 second delay for response

    const quoteTimer = setTimeout(() => {
      setQuoteIndex((current) => {
        const nextIndex = current + 1;
        return nextIndex >= quotes.length ? 0 : nextIndex;
      });
    }, 3000); // Change quote every 3 seconds

    return () => {
      clearTimeout(responseTimer);
      clearTimeout(quoteTimer);
    };
  }, [quoteIndex]);

  return (
    <main className="min-h-screen flex bg-white text-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Grid overlay */}
        <div className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]",
          "bg-[size:24px_24px]"
        )} />

        {/* Rainbow gradient background */}
        <div className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
          "opacity-15 blur-[75px]"
        )} />

        {/* Radial fade overlay */}
        <div className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]"
        )} />
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center p-8 relative z-10">
        {/* Left column */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold mb-2 flex items-center">
              <span className="block xl:inline bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                AI Agents Can Receive,
              </span>
            </h1>
            <h1 className="text-5xl font-bold">
              <span className="block xl:inline bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent flex items-center">
                Hold & Spend Money
                <svg className="w-8 h-8 ml-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 17.5C14.2091 17.5 16 15.7091 16 13.5C16 11.2909 14.2091 9.5 12 9.5C9.79086 9.5 8 11.2909 8 13.5C8 15.7091 9.79086 17.5 12 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 17.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </h1>
            <h1 className="text-4xl font-bold mb-6">
              <span className="block xl:inline bg-gradient-to-r from-[#4ab3e8] to-[#63c6f5] bg-clip-text text-transparent relative group">
                —On Your Terms
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#4ab3e8] transform scale-x-0 animate-[expand_0.8s_ease-out_forwards] hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              AI Handles Payments.{" "}
              <span className="font-medium text-gray-800">
                You Control Every Transaction.
              </span>
            </p>
          </div>

          {/* Add new quotes section */}


          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                Access the payments layer for AI Agents
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  "bg-gradient-to-r from-emerald-50 to-emerald-100",
                  "text-emerald-700",
                  "border border-emerald-200/30",
                  "shadow-sm shadow-emerald-100",
                  "flex items-center gap-1"
                )}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.28 13.61C15.15 14.74 13.53 15.09 12.1 14.64L9.51001 17.22C9.33001 17.41 8.96001 17.53 8.69001 17.49L7.49001 17.33C7.09001 17.28 6.73001 16.9 6.67001 16.51L6.51001 15.31C6.47001 15.05 6.60001 14.68 6.78001 14.49L9.36001 11.91C8.92001 10.48 9.26001 8.86001 10.39 7.73001C12.01 6.11001 14.65 6.11001 16.28 7.73001C17.9 9.34001 17.9 11.98 16.28 13.61Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Secure
                </span>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  "bg-gradient-to-r from-emerald-50 to-emerald-100",
                  "text-emerald-700",
                  "border border-emerald-200/30",
                  "shadow-sm shadow-emerald-100",
                  "flex items-center gap-1"
                )}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 12H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 15L15.5 12L12.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  API first
                </span>
              </p>
            </div>
            {!showWaitlist && !hasSubmittedWaitlist && <WaitlistButton onClick={() => setShowWaitlist(true)} />}

          </div>

          <div className="mt-8 space-y-4 mb-24">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Unlimited Use Cases</h3>
              <p className="text-xs text-gray-400">See how people are using AI Agents for payments</p>
            </div>
            <div className="relative h-[60px]">
              {quotes.map((quote, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "absolute w-full transition-all duration-500 ease-in-out space-y-2",
                    quoteIndex === idx
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  )}
                >
                  {/* User message */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex-1 flex flex-col items-end">
                      <div className="inline-block max-w-[90%] bg-blue-500 rounded-2xl rounded-tr-none px-4 py-2 shadow-sm">
                        <p className="text-sm text-white">{quote.text}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center">
                          {quote.channel === "whatsapp" && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center p-1">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.77 8.93 16.86 9.11 16.86 9.31C16.86 9.5 16.77 9.69 16.64 9.81L10.75 15.7C10.63 15.83 10.44 15.91 10.25 15.91C10.06 15.91 9.87 15.83 9.75 15.7L7.36 13.31C7.23 13.19 7.14 13 7.14 12.81C7.14 12.61 7.23 12.43 7.36 12.31C7.64 12.03 8.11 12.03 8.39 12.31L10.25 14.17L15.61 8.81C15.89 8.53 16.36 8.53 16.64 8.8Z" />
                              </svg>
                            </div>
                          )}
                          {quote.channel === "telegram" && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center p-1">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                                <path d="M2 17L12 22L22 17" />
                                <path d="M2 12L12 17L22 12" />
                              </svg>
                            </div>
                          )}
                          {quote.channel === "slack" && (
                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center p-1">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.99 4C21.99 2.9 21.1 2 20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22L21.99 4ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" />
                              </svg>
                            </div>
                          )}
                          {quote.channel === "phone" && (
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center p-1">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">Just now</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Response with animation */}
                  <div className={cn(
                    "flex items-start gap-3 transition-all duration-500",
                    showResponse
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  )}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-medium">
                      {!showResponse ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : "AI"}
                    </div>
                    <div className="flex-1">
                      <div className="inline-block max-w-[90%] bg-emerald-50 rounded-2xl rounded-tl-none px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-emerald-100/50">
                        <p className="text-sm text-emerald-800">
                          {!showResponse ? (
                            <span className="animate-pulse">Processing request...</span>
                          ) : quote.response}
                        </p>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">Just now</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column - Workflow visualization */}
        <div className="relative">
          <div className="space-y-6 relative z-0">
            {/* Tabs */}
            <div className={cn(
              "flex gap-4 mb-8 transition-all duration-500",
              showWaitlist && "opacity-0 translate-y-[-20px]"
            )}>
              <button
                onClick={() => setActiveTab('send')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTab === 'send'
                    ? "bg-black text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Send Payments
              </button>
              <button
                onClick={() => setActiveTab('receive')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTab === 'receive'
                    ? "bg-black text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Receive & Hold
              </button>
            </div>

            {/* Content Area */}
            <div className="relative h-[500px]">
              {/* Steps */}
              <div className={cn(
                "grid gap-6  inset-0 transition-all duration-500",
                showWaitlist ? "opacity-0 translate-x-[-100px] pointer-events-none" : "opacity-100 translate-x-0 animate-in slide-in-from-bottom-8 duration-700"
              )}>
                {(activeTab === 'send' ? sendPaymentSteps : receiveHoldSteps).map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}
                        {step.badge && (
                          <span className={cn(
                            "ml-2 px-2 py-0.5 text-xs font-medium rounded-full",
                            "bg-gradient-to-r from-emerald-50 to-emerald-100",
                            "text-emerald-700",
                            "border border-emerald-200/30",
                            "shadow-sm shadow-emerald-100",
                          )}>
                            {step.badge}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Waitlist Form */}
              <div className={cn(
                "absolute inset-0 transition-all duration-500",
                showWaitlist ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[100px] pointer-events-none"
              )}>
                <div className="bg-white/90 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Join the Waitlist</h2>
                    <button
                      onClick={() => setShowWaitlist(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <WaitlistForm onSuccess={() => {
                    setShowWaitlist(false);
                    setActiveTab('send');
                    setHasSubmittedWaitlist(true);
                    // Add any additional success handling here
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="absolute bottom-8 right-8 text-xs text-right text-muted-foreground">
        © 2025 Freelii Tech, Inc. All rights reserved.{' • '}
        <Link href="/terms" className="text-gray-400 hover:text-blue-400">Terms</Link>{' • '}
        <Link href="/privacy" className="text-gray-400 hover:text-blue-400">Privacy</Link>
      </span>
    </main>
  )
}

