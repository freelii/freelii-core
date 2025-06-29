"use client";

import { cn } from "@freelii/utils";
import { CreditCard, Globe, Shield, Store } from "lucide-react";
import Image from "next/image";

const features = [
    {
        icon: CreditCard,
        title: "Virtual Cards",
        description: "Create virtual cards for online purchases",
        className: "bg-blue-50/50"
    },
    {
        icon: Store,
        title: "In-Store Payments",
        description: "Add your card to Apple or Google Pay",
        className: "bg-green-50/50"
    },
    {
        icon: Globe,
        title: "Spend as Dollars",
        description: "Spend your digital dollars as regular dollars",
        className: "bg-purple-50/50"
    },
    {
        icon: Shield,
        title: "Card Controls",
        description: "Lock cards, set limits, and manage permissions",
        className: "bg-orange-50/50"
    }
]

export default function CardsPage() {


    return (
        <div className="min-h-screen flex bg-transparent text-black">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-transparent z-10">


                <div className="w-full max-w-sm space-y-6 relative z-30">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">
                            Your Digital Card is Coming Soon
                        </h2>
                        <p className="text-muted-foreground">
                            We know that spending digital currencies isn&apos;t always easy, and we&apos;re working to change that.
                        </p>
                    </div>

                    {/* Credit Card Design */}
                    <div className={cn(
                        "mt-8 w-[425px] h-[250px] rounded-2xl p-6 relative overflow-hidden opacity-60",
                        "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
                        "before:absolute before:inset-0 before:bg-black/10 before:z-10",
                        "backdrop-blur-sm"
                    )}>
                        {/* Freelii Logo */}
                        <div className="absolute top-6 left-6 w-12 h-12 opacity-20 z-20">
                            <Image
                                src="/Freelii-ribbon.png"
                                alt="Freelii"
                                width={48}
                                height={48}
                                className="object-contain filter brightness-200"
                            />
                        </div>

                        {/* Existing card content with reduced opacity */}
                        <div className="relative opacity-10">
                            {/* Card chip */}
                            <div className="w-12 h-8 rounded bg-yellow-300/90 mb-8 relative z-20" />

                            {/* Card number */}
                            <div className="text-white tracking-wider text-lg font-mono relative z-20">
                                •••• •••• •••• ••••
                            </div>

                            {/* Card details */}
                            <div className="mt-4 flex justify-between items-center relative z-20">
                                <div className="text-white text-sm">
                                    <div className="uppercase text-xs opacity-75">Card Holder</div>
                                    <div>JOHN DOE</div>
                                </div>
                                <div className="text-white text-sm">
                                    <div className="uppercase text-xs opacity-75">Expires</div>
                                    <div>••/••</div>
                                </div>
                            </div>
                        </div>

                        {/* Glass effect overlay */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10" />

                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full translate-x-16 -translate-y-16 z-20" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/10 rounded-full translate-x-8 translate-y-8 z-20" />
                    </div>
                </div>
            </div>



            {/* Right side - Background */}
            <div className="flex-1 p-8 relative hidden md:block overflow-hidden">
                <div className="absolute top-0 left-0 w-20 -ml-12 h-full z-50 bg-gradient-to-r from-white via-white to-transparent" />
                {/* Diagonal white overlay that extends into the right side */}
                <div className="overflow-hidden absolute top-0 right-0 w-[150%] h-[70%] bg-gradient-to-b from-white via-white to-transparent transform rotate-[-20deg] translate-y-[-20%] translate-x-[20%] z-20" />


                {/* Grid overlay */}
                <div className={cn(
                    "pointer-events-none absolute inset-0",
                    "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]",
                    "bg-[size:24px_24px]"
                )} />

                {/* Gradient background */}
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

                {/* Content */}
                <div className="relative h-full flex items-center justify-center">
                    <div className="max-w-md z-30">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            What you get with a Freelii Card
                        </h2>
                        <div className="space-y-6 mt-8 animate-in slide-in-from-bottom-8 duration-700">

                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 bg-white/90 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <feature.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{feature.title}</h3>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 