"use client";

import { useWalletStore } from "@/hooks/stores/wallet-store";
import { api } from "@/trpc/react";
import { useWallet } from "@/wallet/useWallet";
import { Button, Input, LoadingDots } from "@freelii/ui";
import { cn } from "@freelii/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "node_modules/@freelii/ui/src/logo";
import { useState } from "react";

export function WalletOnboarding() {
    const [loading, setLoading] = useState(false);
    const [walletName, setWalletName] = useState("Main Wallet");
    const { create } = useWallet();
    const { setSelectedWalletId } = useWalletStore();
    const router = useRouter();

    // tRPC
    const trpcUtils = api.useUtils();


    const handleCreateWallet = async () => {
        setLoading(true);
        const newWallet = await create(walletName);
        await trpcUtils.wallet.getAll.invalidate();
        if (newWallet) {
            setSelectedWalletId(newWallet.id);
        }
        setLoading(false);
        router.push("/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 p-6">
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome to Freelii
                        <Logo className="h-8 w-8" />
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Let&apos;s set up your secure account protected by your device&apos;s fingerprint or face recognition
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="walletName" className="block text-sm font-medium text-gray-700">
                            Give your account a name
                        </label>
                        <Input
                            id="walletName"
                            type="text"
                            placeholder="Main Wallet"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            Your account will be protected by biometric authentication for maximum security{" "}
                            <Link href="/security" className="text-blue-600 hover:text-blue-800 hover:underline">
                                Learn more
                            </Link>
                        </p>
                    </div>

                    <Button
                        className={cn("w-full", loading && "py-3")}
                        onClick={handleCreateWallet}
                        disabled={loading}
                    >
                        {loading ?
                            <LoadingDots className="w-4 h-full" color="white" />
                            : "Create Wallet"}
                    </Button>
                </div>
            </div>
        </div>
    );
} 