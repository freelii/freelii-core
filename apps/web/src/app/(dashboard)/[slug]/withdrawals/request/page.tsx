"use client"
import { api } from "@/trpc/react";
import { PageContent } from "@/ui/layout/page-content";
import { FlagIcon } from "@/ui/shared/flag-icon";
import { useWallet } from "@/wallet/useWallet";
import { Badge, Button, Input, LoadingDots, MaxWidthWrapper, useRouterStuff } from "@freelii/ui";
import { CURRENCIES } from "@freelii/utils/constants";
import { cn, fromStroops, hasEnoughBalance, shortAddress, toStroops } from "@freelii/utils/functions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Check, Download, Edit2, Network, NetworkIcon, Wallet2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

dayjs.extend(relativeTime)

const CASH_OUT_FEE = 0.0005;

export default function WithdrawalsRequestPage() {
    const { searchParams, router } = useRouterStuff()
    const { account } = useWallet();
    const [amount, setAmount] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)

    const to = searchParams.get('to');
    const { data: accounts } = api.users.listWithdrawalAccounts.useQuery();

    const [destination, currency] = useMemo(() => {
        if (accounts) {
            let destination = accounts.blockchain_accounts?.find(acc => acc.id === to);
            if (destination) { Object.assign(destination, { type: 'blockchain' }); } else {
                destination = accounts.fiat_accounts?.find(acc => acc.id === to)
                if (destination) { Object.assign(destination, { type: 'fiat' }); } else {
                    destination = accounts.ewallet_accounts?.find(acc => acc.id === to)
                    if (destination) { Object.assign(destination, { type: 'ewallet' }); }
                }
            }


            let currency = "USDC";
            if (destination && "iso_currency" in destination) {
                currency = destination.iso_currency;
            }
            return [destination, currency]
        }
        return [null, null];
    }, [accounts, to])

    if (!destination) {
        return (
            <PageContent titleBackButtonLink="/dashboard/withdrawals" title="Request Withdrawal">
                <MaxWidthWrapper>
                    <div className="text-center py-12">
                        <p className="text-gray-500">Please select a destination account first</p>
                    </div>
                </MaxWidthWrapper>
            </PageContent>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setIsProcessing(true)
        // TODO: Implement withdrawal submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSubmitting(false)
        setIsProcessing(false)
        setIsConfirmed(true)
    }

    const totalFees = 0.001
    const fxRate = CURRENCIES[currency]?.rate ?? 1
    const totalCost = (fxRate * Number(amount)) + totalFees

    return (
        <PageContent titleBackButtonLink="/dashboard/withdrawals" title="Request Withdrawal">
            <MaxWidthWrapper>
                <div className="w-full relative space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
                        {/* Left side - Recipient Details */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
                                <div className="space-y-6">
                                    {/* Recipient Card */}
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-medium text-gray-900">Recipient Details</h3>
                                            <Button variant="outline" className="text-xs" onClick={() => router.push(`/dashboard/withdrawals`)}>
                                                <Edit2 className="size-3 mr-1.5" />
                                                Edit
                                            </Button>
                                        </div>

                                        {/* Summary Card - Conditionally render based on destination type */}
                                        <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
                                            {/* Account Info Header */}
                                            <div className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {destination.type === 'fiat' && (
                                                        <>
                                                            <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                                <Building2 className="size-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                                                                <p className="text-sm text-gray-500">Send to bank account</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {destination.type === 'ewallet' && (
                                                        <>
                                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <Wallet2 className="size-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">E-Wallet Transfer</h4>
                                                                <p className="text-sm text-gray-500">Send to digital wallet</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {destination.type === 'blockchain' && (
                                                        <>
                                                            <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                                                <Network className="size-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">Crypto Transfer</h4>
                                                                <p className="text-sm text-gray-500">Send to blockchain address</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Account Details */}
                                            <div className="p-4 space-y-3 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    {destination.type === 'fiat' && (
                                                        <>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Account number</p>
                                                                <p className="text-sm">{destination.account_number}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Currency</p>
                                                                <div className="flex items-center gap-1.5">
                                                                    <FlagIcon currencyCode={currency} className="size-4" />
                                                                    <span className="text-sm">{currency}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    {destination.type === 'ewallet' && (
                                                        <>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Account ID</p>
                                                                <p className="text-sm">{destination.account_id}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Provider</p>
                                                                <p className="text-sm">{destination.provider}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {destination.type === 'blockchain' && (
                                                        <>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                                                <p className="text-sm font-mono">{shortAddress(destination.address)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Network</p>
                                                                <div className="flex items-center gap-1.5">
                                                                    <NetworkIcon network={destination.network} className="size-4" />
                                                                    <span className="text-sm">{destination.network}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Amount Info */}
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Will receive</span>
                                                    <span className="text-sm font-medium">
                                                        {'network' in destination ? (
                                                            <span className="flex items-center gap-1">
                                                                {(Number(amount) * fxRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {currency}
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {CURRENCIES[currency]?.symbol}
                                                                {(Number(amount) * fxRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Estimated delivery</span>
                                                    <span className="text-sm">
                                                        {destination.type === 'blockchain' ? 'Few minutes' :
                                                            destination.type === 'ewallet' ? 'Instant' :
                                                                '1-2 business days'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Origin Account */}
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Withdrawal From</h4>
                                            <div className="rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <FlagIcon currencyCode="USDC" className="size-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">USDC Wallet</p>
                                                            <p className="text-xs text-gray-500">{shortAddress(account?.address)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{fromStroops(account?.main_balance?.amount, 2)} USDC</p>
                                                        {amount && account && (
                                                            <p className={cn(
                                                                "text-xs",
                                                                hasEnoughBalance((account?.main_balance?.amount ?? 0), toStroops(amount))
                                                                    ? "text-gray-500"
                                                                    : "text-red-500"
                                                            )}>
                                                                {hasEnoughBalance((account?.main_balance?.amount ?? 0), toStroops(amount))
                                                                    ? "Available balance"
                                                                    : "Insufficient balance"
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Withdrawal Details */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">Withdrawal Details</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Review the withdrawal breakdown before confirming
                                        </p>
                                    </div>

                                    {/* Amount Input */}
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount
                                        </label>
                                        <div className="relative flex-1">
                                            <div className="absolute left-0 inset-y-0 flex items-center pl-3">
                                                <FlagIcon
                                                    currencyCode={"USDC"}
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                <span className="text-gray-500 sm:text-sm">
                                                    {CURRENCIES.USDC?.symbol}
                                                </span>
                                            </div>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                min={0}
                                                step={0.01}
                                                className="pl-16 h-11 text-lg"
                                                value={amount}
                                                onChange={(e) => {
                                                    setAmount(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="mt-8 space-y-4">
                                        <h4 className="text-sm font-medium text-gray-900">Breakdown</h4>

                                        {/* Amount Received */}
                                        <div className="flex justify-between items-center py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-700">Amount received</span>
                                            </div>
                                            <span className="text-sm text-gray-900">
                                                {CURRENCIES[currency]?.symbol}
                                                {(Number(amount) * fxRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Exchange Rate */}
                                        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                        <FlagIcon
                                                            currencyCode={"USDC"}
                                                            className="size-5 rounded-full border-2 border-white"
                                                        />
                                                        <FlagIcon
                                                            currencyCode={currency}
                                                            className="size-5 -ml-2.5 rounded-full border-2 border-white"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-700">Exchange rate</span>
                                                        <span className="text-xs text-gray-500">USDC → {currency}</span>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="font-medium">
                                                    1 USDC = {CURRENCIES[currency]?.symbol}{CURRENCIES[currency]?.rate}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Fees */}
                                        <div className="flex justify-between items-center py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-700">Withdrawal fee</span>
                                            </div>
                                            <span className="text-sm text-gray-900">
                                                {CURRENCIES.USDC?.symbol}
                                                {(Number(amount) * CASH_OUT_FEE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Total */}
                                        <div className="pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-900">Total</span>
                                                <span className="text-base font-medium text-gray-900">
                                                    {CURRENCIES.USDC?.symbol}
                                                    {(Number(amount) * (1 + CASH_OUT_FEE)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Submit Button Section */}
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">Ready to withdraw?</p>
                                        <p className="text-sm text-gray-500">
                                            Double check the details before confirming
                                        </p>
                                    </div>
                                    <Button
                                        disabled={!amount || Number(amount) <= 0 || !hasEnoughBalance((account?.main_balance?.amount ?? 0), toStroops(amount))}
                                        onClick={handleSubmit}
                                        className={cn(
                                            "gap-2",
                                            isProcessing && "opacity-50 py-3 px-6"
                                        )}
                                    >
                                        {isProcessing ?
                                            <LoadingDots className="size-4" color="white" /> :
                                            <>
                                                <ArrowRight className="size-4 mr-2" />
                                                Confirm Withdrawal
                                            </>
                                        }
                                    </Button>
                                </div>

                                {/* Terms and Conditions */}
                                <p className="mt-4 text-xs text-gray-500">
                                    By confirming this withdrawal, you agree to our{' '}
                                    <Link href="/terms" className="text-primary hover:text-primary/80">
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </MaxWidthWrapper>

            <AnimatePresence>
                {isConfirmed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="size-16 rounded-full bg-green-100 mx-auto flex items-center justify-center"
                            >
                                <Check className="size-8 text-green-600" />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold">Withdrawal Confirmed!</h2>
                                <p className="text-gray-500">
                                    Your withdrawal of {CURRENCIES[currency]?.symbol}
                                    {(Number(amount) * (1 + CASH_OUT_FEE)).toLocaleString('en-US', { minimumFractionDigits: 2 })} has been initiated.
                                    We&apos;ll notify you once it&apos;s processed.
                                </p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => {
                                        // Add download receipt logic here
                                    }}
                                >
                                    <Download className="size-4" />
                                    Download Confirmation
                                </Button>

                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        window.location.href = '/dashboard'
                                    }}
                                >
                                    Return to Dashboard
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContent>
    )
}