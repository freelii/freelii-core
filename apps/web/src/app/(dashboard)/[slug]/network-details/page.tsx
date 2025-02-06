"use client"
import { XLMIcon } from "@/ui/icons/xlm-icon";
import { PageContent } from "@/ui/layout/page-content";
import { USDCBadge } from "@/ui/shared/badges/usdc-badge";
import { useWallet } from "@/wallet/useWallet";
import { Button, MaxWidthWrapper, useCopyToClipboard } from "@freelii/ui";
import { shortAddress } from "@freelii/utils/functions";
import { Clock, Copy, Info, Shield, User, Wallet } from "lucide-react";



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
                                Account
                            </h3>
                            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Wallet Address</div>
                                    {isLoading ? (
                                        <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                                    ) : (
                                        <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg">
                                            <code className="text-xs text-gray-600">{shortAddress(account?.address, 6)}</code>
                                            <Button
                                                variant="ghost"
                                                className="h-6 w-6 hover:bg-gray-100"
                                                onClick={() => void copyToClipboard(account?.address, false)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Network</div>
                                    {isLoading ? (
                                        <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse" />
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <XLMIcon className="h-4 w-4" />
                                                <div className="text-sm text-gray-700 capitalize">{account?.network || 'Not connected'}</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                Learn more about {account?.network || 'Stellar'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Asset Section */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-gray-400" />
                                Asset
                            </h3>
                            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Current Asset</div>
                                    {isLoading ? (
                                        <div className="h-6 w-32 bg-gray-100 rounded-md animate-pulse" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <USDCBadge className="bg-blue-50 text-blue-700 border-blue-200" />
                                            <span className="text-sm text-gray-700">Circle USD Coin</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Last Updated</div>
                                    {isLoading ? (
                                        <div className="h-5 w-28 bg-gray-100 rounded-md animate-pulse" />
                                    ) : (
                                        <div className="text-sm text-gray-700 flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            7 minutes ago
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-400" />
                                Information
                            </h3>
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl border border-blue-100 h-[calc(100%-32px)]">
                                {isLoading ? (
                                    <div className="space-y-3 pt-4">
                                        <div className="h-5 w-32 bg-blue-100/50 rounded-md animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-blue-100/50 rounded-md animate-pulse" />
                                            <div className="h-4 w-5/6 bg-blue-100/50 rounded-md animate-pulse" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col justify-center">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-blue-800">
                                                <Shield className="h-4 w-4" />
                                                <span className="text-sm font-medium">About Your Funds</span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-blue-700">
                                                Your funds are held in USD, ensuring fast and cost-effective transactions
                                                while maintaining full regulatory compliance.
                                            </p>
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