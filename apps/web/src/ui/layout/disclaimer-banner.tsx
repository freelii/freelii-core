"use client";
import { Badge } from "@freelii/ui";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function DisclaimerBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
                aria-label="Close disclaimer"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <Badge className="uppercase">Sandbox Environment</Badge>
            </div>
            <p className="mt-2 text-sm text-yellow-800">
                This product is still in development. This is a test environment - please do not use real funds or transfer sensitive information.
                For any matters regarding this product, please contact
                <a href="mailto:jose@freelii.app" className="text-yellow-800 hover:text-yellow-600"> jose@freelii.app</a>
            </p>
        </div>
    )
}
