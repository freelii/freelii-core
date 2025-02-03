"use client";
import { WalletOnboarding } from "@/components/onboarding/wallet-onboarding";
import { api } from "@/trpc/react";
import { Skeleton } from "@freelii/ui";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

function LoadingSkeleton() {
    return (
        <div className="min-h-screen w-full bg-white p-4 space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function Layout({ children }: { children: ReactNode }) {
    const session = useSession();

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
