"use client"
import { XLMIcon } from "@/ui/icons/xlm-icon";
import { PageContent } from "@/ui/layout/page-content";
import { USDCBadge } from "@/ui/shared/badges/usdc-badge";
import { useWallet } from "@/wallet/useWallet";
import { Button, MaxWidthWrapper, useCopyToClipboard } from "@freelii/ui";
import { shortAddress } from "@freelii/utils/functions";
import { Copy, Info, Shield, User, Wallet } from "lucide-react";
import Link from "next/link";



export default function NetworkDetails() {
    const [, copyToClipboard] = useCopyToClipboard()
    const { account, isLoadingAccount: isLoading } = useWallet();

    return (
        <PageContent title="Network Details" description="View your network details">
            <MaxWidthWrapper>
                <div className="space-y-8">

                    {/* Main Content */}
                    <div className="grid grid-cols-3 gap-8">
                        {/* Account Section */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Account Overview
                            </h3>
                            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Account Name</div>
                                    {isLoading ? (
                                        <div className="h-6 w-24 bg-gray-100 rounded-md animate-pulse" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{account?.alias || 'Default Account'}</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-xs text-green-700 font-medium">Active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Wallet Address</div>
                                    {isLoading ? (
                                        <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-lg">
                                                <code className="text-xs text-gray-600 font-mono">{shortAddress(account?.address, 8)}</code>
                                                <Button
                                                    variant="outline"
                                                    className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                                    onClick={() => void copyToClipboard(account?.address, false)}
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    <span>Copy</span>
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Your unique blockchain identifier for receiving payments
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Network Connection</div>
                                    {isLoading ? (
                                        <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse" />
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <XLMIcon className="h-4 w-4" />
                                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                                        {account?.network ?? 'Not connected'}
                                                    </div>
                                                </div>
                                                <Link
                                                    href="https://stellar.org/learn/intro-to-stellar"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    Learn more
                                                    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span>Fast & secure transactions</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span>Low network fees</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span>Decentralized infrastructure</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Asset Section */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-gray-400" />
                                Digital Asset
                            </h3>
                            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Primary Stablecoin</div>
                                    {isLoading ? (
                                        <div className="h-6 w-32 bg-gray-100 rounded-md animate-pulse" />
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                                                <span className="text-sm font-medium text-gray-900">USD Coin (USDC)</span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                Fully-backed digital dollar stablecoin issued by Circle
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Key Features</div>
                                    {isLoading ? (
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse" />
                                            <div className="h-4 w-3/4 bg-gray-100 rounded-md animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>1:1 USD backing & redeemability</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>Regulated & transparent reserves</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span>24/7 global settlement</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <Link
                                        href="https://www.circle.com/usdc"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Learn more about USDC
                                        <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-400" />
                                Security & Compliance
                            </h3>
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl border border-blue-100 h-[calc(100%-32px)]">
                                {isLoading ? (
                                    <div className="space-y-3 pt-4">
                                        <div className="h-5 w-32 bg-blue-100/50 rounded-md animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-blue-100/50 rounded-md animate-pulse" />
                                            <div className="h-4 w-5/6 bg-blue-100/50 rounded-md animate-pulse" />
                                            <div className="h-4 w-4/5 bg-blue-100/50 rounded-md animate-pulse" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-blue-800">
                                                    <Shield className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Fund Security</span>
                                                </div>
                                                <p className="text-xs leading-relaxed text-blue-700">
                                                    Your digital assets are secured through institutional-grade custody
                                                    and regulatory compliance frameworks.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-xs font-medium text-blue-800 mb-1">Key Benefits</div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-xs text-blue-700">
                                                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                                        <span>Real-time settlement</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-blue-700">
                                                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                                        <span>Low transaction costs</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-blue-700">
                                                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                                        <span>Global accessibility</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-blue-700">
                                                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                                        <span>Regulatory compliance</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-blue-200/50">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-blue-600 font-medium">Platform Status</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-green-700 font-medium">Operational</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
} 