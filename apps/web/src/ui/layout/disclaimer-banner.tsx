"use client";
import { Badge } from "@freelii/ui";
import { Info, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function DisclaimerBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 right-4 max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
                aria-label="Close notice"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Public Beta</Badge>
            </div>
            <p className="mt-2 text-sm text-blue-800">
                Welcome to Freelii&apos;s public beta! Our smart contracts are currently undergoing security audits.
                Please proceed with caution and review our{" "}
                <Link href="/terms-of-service" className="underline hover:no-underline">Terms of Service</Link>.
            </p>
        </div>
    )
}
