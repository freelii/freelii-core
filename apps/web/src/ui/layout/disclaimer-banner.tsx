import { Badge } from "@freelii/ui"
import { AlertTriangle } from "lucide-react"

export function DisclaimerBanner() {
    return (
        <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <Badge className="uppercase">Sandbox Environment</Badge>
            </div>
            <p className="mt-2 text-sm text-yellow-800">
                This product is still in development. This is a test environment - please do not use real funds or transfer sensitive information. Any transactions performed here are for testing purposes only. For any matters regarding this product, please contact
                <a href="mailto:jose@freelii.app" className="text-yellow-800 hover:text-yellow-600"> jose@freelii.app</a>
            </p>
        </div>
    )
}
