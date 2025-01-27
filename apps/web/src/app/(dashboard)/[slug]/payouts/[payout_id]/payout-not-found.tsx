import { Button } from "@freelii/ui"
import { FileX } from "lucide-react"
import Link from "next/link"

export function PayoutNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-300">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
                <FileX className="size-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payout Not Found</h2>
            <p className="text-gray-500 text-center mb-6 max-w-[400px]">
                The payout you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="../payouts">
                <Button variant="outline" className="gap-2">
                    View All Payouts
                </Button>
            </Link>
        </div>
    )
}

