"use client";
import { WalletOnboarding } from "@/components/onboarding/wallet-onboarding";
import { api } from "@/trpc/react";
import { useWallet } from "@/wallet/useWallet";
import { Skeleton } from "@freelii/ui";
import { cn } from "@freelii/utils";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

function LoadingSkeleton() {
    return (
        <div className="min-h-screen flex bg-transparent">

            {/* Main content */}
            <div className="flex-1 p-8 relative">
                {/* Grid overlay */}
                <div className={cn(
                    "pointer-events-none absolute inset-0",
                    "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]",
                    "bg-[size:24px_24px]",
                    "rounded-tl-lg",
                )} />

                {/* Gradient background */}
                <div className={cn(
                    "pointer-events-none absolute inset-0",
                    "rounded-tl-lg",
                    "bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]",
                    "opacity-15 blur-[75px]"
                )} />

                {/* Radial fade overlay */}
                <div className={cn(
                    "pointer-events-none absolute inset-0",
                    "rounded-tl-lg",
                    "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]"
                )} />

                {/* Skeleton content */}
                <div className="relative z-10 space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48 bg-transparent" />
                        <Skeleton className="h-8 w-24 bg-transparent" />
                    </div>

                    {/* Content skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full bg-transparent" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-48 w-full bg-transparent" />
                            <Skeleton className="h-48 w-full bg-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-24 w-full bg-transparent" />
                            <Skeleton className="h-24 w-full bg-transparent" />
                            <Skeleton className="h-24 w-full bg-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Layout({ children }: { children: ReactNode }) {
    const session = useSession();
    const { } = useWallet();

    // Query for wallets
    const { data: wallets, isLoading: isLoadingWallets } = api.wallet.getAll.useQuery(
        undefined,
        {
            enabled: session?.status === "authenticated",
        }
    );

    if (session?.status === "unauthenticated") {
        redirect("/login");
    }

    if (session?.status === "loading" || isLoadingWallets) {
        return <LoadingSkeleton />;
    }

    // Show onboarding if user has no wallets
    if (session?.status === "authenticated" && wallets?.length === 0) {
        return <WalletOnboarding />;
    }

    if (session?.status === "authenticated") {
        return <>{children}</>;
    }

    return <div>Error</div>;
}
