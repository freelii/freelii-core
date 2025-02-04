import { Badge } from "@freelii/ui"
import { RocketIcon } from "lucide-react"

export default function ComingSoonPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#4ab3e8] to-[#2d8fc0] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-900 ring-1 ring-gray-900/5 rounded-lg leading-none flex items-center p-8">
                    <RocketIcon className="h-8 w-8 text-[#4ab3e8] animate-bounce" />
                    <Badge className="ml-4 bg-gradient-to-r from-[#4ab3e8] to-[#2d8fc0] hover:from-[#3da1d3] hover:to-[#267aa6]">
                        Coming Soon
                    </Badge>
                </div>
            </div>

            <h1 className="mt-8 text-3xl font-bold tracking-tight">
                Your Digital Card is Coming Soon
            </h1>
            <p className="mt-4 text-gray-500 max-w-md">
                We know that spending crypto isn&apos;t always easy, and we&apos;re working to change that.
                By partnering with leading card issuers, we&apos;re bringing you a seamless way to use your stablecoins anywhere.
            </p>
        </div>
    )
}
