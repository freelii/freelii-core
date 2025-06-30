"use client";

import { useWalletStore } from "@/hooks/stores/wallet-store";
import { api } from "@/trpc/react";
import { FlagIcon } from "@/ui/shared/flag-icon";
import { useWallet } from "@/wallet/useWallet";
import { Button, ExpandingArrow, Input, LoadingDots } from "@freelii/ui";
import { cn } from "@freelii/utils";
import { Globe, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WalletOnboarding() {
    const [loading, setLoading] = useState(false);
    const [showTermsStep, setShowTermsStep] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [betaRisksAccepted, setBetaRisksAccepted] = useState(false);
    const { create } = useWallet();
    const { setSelectedWalletId, wallets } = useWalletStore();
    const [walletName, setWalletName] = useState("");
    const router = useRouter();
    const trpcUtils = api.useUtils();

    const handleProceedToTerms = () => {
        if (wallets.length === 0) {
            setShowTermsStep(true);
        } else {
            handleCreateWallet();
        }
    };

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

    const handleBackToForm = () => {
        setShowTermsStep(false);
        setTermsAccepted(false);
        setBetaRisksAccepted(false);
    };

    if (showTermsStep) {
        return (
            <div className="min-h-screen flex bg-transparent text-black">
                <div className="flex-1 flex items-center justify-center p-8 bg-transparent z-10">
                    <div className="w-full max-w-lg space-y-6 relative z-30">
                        <div className="flex items-center gap-3 mb-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBackToForm}
                                className="p-2 hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div>
                                <h2 className="text-2xl font-semibold">Terms of Service</h2>
                                <p className="text-sm text-gray-500">Please review and accept before creating your first wallet</p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-blue-700 font-medium text-xs">Beta Service Agreement</span>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-blue-700 font-medium mb-1">Beta Notice:</p>
                                    <p className="text-xs text-blue-600">
                                        Freelii is currently in public beta. While we're working hard to make it reliable, please be aware that some features are still being refined.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">What to Keep in Mind</h3>
                                        <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside">
                                            <li>Our smart contracts are still being refined and tested</li>
                                            <li>As with all crypto, there's always a risk of fund loss</li>
                                            <li>Your account access is linked to our domain</li>
                                            <li>Some features like fiat transfers are still in development</li>
                                            <li>We can't help recover lost PassKeys or reverse transactions</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">How It Works</h3>
                                        <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside">
                                            <li>You have full control of your wallet and private keys</li>
                                            <li>Transactions are permanent once confirmed on the blockchain</li>
                                            <li>Please use the service lawfully and responsibly</li>
                                            <li>We recommend starting with small amounts or using testnet</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        For complete terms, visit our full{" "}
                                        <Link href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                                            Terms of Service
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">
                                    I have read and agree to the Terms of Service and understand this is beta software
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={betaRisksAccepted}
                                    onChange={(e) => setBetaRisksAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">
                                    I understand the nature of cryptocurrency and will use this service responsibly
                                </span>
                            </label>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleCreateWallet}
                            disabled={!termsAccepted || !betaRisksAccepted || loading}
                        >
                            {loading ? (
                                <LoadingDots className="w-4 h-full" color="white" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Accept & Create Account
                                    <ExpandingArrow className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-transparent text-black">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-transparent z-10">

                <div className="w-full max-w-sm space-y-6 relative z-30">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">
                            {wallets.length > 0 ? "Create additional account" : "Let's get you started"}
                        </h2>
                        <p className="text-muted-foreground">
                            Every transaction will require authorization using your device&apos;s security features
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-muted-foreground">Account Name</label>
                            <Input
                                id="walletName"
                                type="text"
                                placeholder={wallets.length > 0 ? `Personal Account ${wallets.length + 1}` : "Personal Account"}
                                value={walletName}
                                onChange={(e) => setWalletName(e.target.value)}
                                className="mt-1 bg-transparent border-gray-400 ring-0 focus:ring-0 focus:border-gray-400 focus:outline-none focus:border-[1px] focus:border-gray-400"
                            />
                            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Protected with biometric security
                            </p>
                        </div>

                        <Button
                            className={cn("w-full group", loading && "py-3")}
                            onClick={handleProceedToTerms}
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingDots className="w-4 h-full" color="white" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Create Account
                                    <ExpandingArrow className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                        
                        {wallets.length > 0 && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                                By creating a wallet you agree to our{" "}
                                <Link href="/terms-of-service" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>
                            </p>
                        )}
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
                        <h2 className="text-2xl font-semibold text-gray-900">Key Features</h2>
                        <div className="space-y-6 mt-8 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-start gap-3 p-4 bg-white/90 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium">Two-Step Security</h3>
                                    <p className="text-sm text-gray-600">Every transaction requires your personal confirmation</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-white/90 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Global Transactions</h3>
                                    <p className="text-sm text-gray-600">Gain global access to US transactions</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-white/90 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium">Real-time Analytics</h3>
                                    <p className="text-sm text-gray-600">Track your business performance instantly</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-white/90 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FlagIcon currencyCode="USDC-Hardcoded" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Digital Currency Ready</h3>
                                    <p className="text-sm text-gray-600">Your deposits are automatically secured in digital dollars
                                        <Link href="/stablecoins" className="text-primary ml-2">
                                            <span className=" items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                                                Learn more
                                            </span>
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 