"use client"
import { useFixtures } from "@/fixtures/useFixtures";
import { PageContent } from "@/ui/layout/page-content";
import { FlagIcon } from "@/ui/shared/flag-icon";
import { Badge, Button, Input, LoadingSpinner, MaxWidthWrapper, Separator, useRouterStuff } from "@freelii/ui";
import { CURRENCIES } from "@freelii/utils/constants";
import { cn } from "@freelii/utils/functions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Building2, ChevronRight, Edit2 } from "lucide-react";
import { useState } from "react";


dayjs.extend(relativeTime)

const CASH_OUT_FEE = 0.0005;

export default function WithdrawalsRequestPage() {
    const { searchParams, router } = useRouterStuff()
    const { fiatAccounts, usdcAccount, getBalance } = useFixtures()
    const [amount, setAmount] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const to = searchParams.get('to');
    const destination = to ? fiatAccounts.find(account => account.id === to) : null;

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
        // TODO: Implement withdrawal submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSubmitting(false)
    }

    const totalFees = 0.001
    const fxRate = CURRENCIES[destination.currency]?.rate ?? 1
    const totalCost = (fxRate * Number(amount)) + totalFees

    return (
        <PageContent titleBackButtonLink="/dashboard/withdrawals" title="Request Withdrawal">
            <MaxWidthWrapper>
                <div className="w-full relative space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
                        {/* Left side - Recipient Details */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg border border-gray-200">
                                <div className="space-y-6">
                                    {/* Recipient Card */}
                                    <div className="">
                                        <div className="">
                                            <div className="flex items-start gap-3">
                                                <FlagIcon currencyCode={destination.currency} size={48} />
                                                <div className="flex-1">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{destination.account_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Building2 className="size-3 text-gray-500" />
                                                            <span className="text-xs text-gray-500">{destination.bank_name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Will receive</span>
                                                    <span className="font-medium">
                                                        {CURRENCIES[destination.currency]?.symbol}
                                                        {(Number(amount) * fxRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Currency</span>
                                                    <div className="flex items-center gap-2">
                                                        <FlagIcon
                                                            currencyCode={destination.currency}
                                                            className="size-4"
                                                        />
                                                        <span>{destination.currency}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Estimated delivery</span>
                                                    <span>1-2 business days</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                <h4 className="text-sm font-medium">Bank Account Details</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Account holder</span>
                                                        <span>{destination.account_name}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Account number</span>
                                                        <span>{destination.account_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Origin Account */}
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium mb-3">Withdrawal From</h4>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">USDC Account</span>
                                                    <span className="text-xs text-gray-500">
                                                        {usdcAccount.accountNumber}
                                                    </span>
                                                </div>

                                                <div className="flex items-start justify-between gap-3">
                                                    <Badge className="bg-green-50 text-green-700 border-green-200">
                                                        <span className="size-1.5 rounded-full bg-current" />
                                                        <span className="text-[10px]">Active</span>
                                                    </Badge>

                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-1">
                                                            <FlagIcon
                                                                currencyCode={usdcAccount.currency.shortName}
                                                                className="size-3"
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {usdcAccount.balance.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500">Available balance</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Payment Details */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-lg">Payment Details</h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Review the payment breakdown before confirming
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative flex-1">
                                            <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gray-200 pr-4 pl-2 py-2 rounded-l-md">
                                                <FlagIcon
                                                    currencyCode={usdcAccount.currency.shortName}
                                                    size={16}
                                                />
                                                <span className="text-sm text-gray-500">
                                                    {CURRENCIES[usdcAccount.currency.shortName]?.symbol}
                                                </span>
                                            </div>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-16 hover:border-gray-200 focus:border-none"
                                                value={amount}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setAmount(value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-6">
                                        {/* Amount and FX Details */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Recipient will receive</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    {CURRENCIES[destination.currency]?.symbol}
                                                    {(Number(amount) * fxRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <Separator />

                                            {/* FX Details */}
                                            <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            <FlagIcon
                                                                currencyCode={usdcAccount.currency.shortName}
                                                                className="size-4 rounded-full border-2 border-white"
                                                            />
                                                            <FlagIcon
                                                                currencyCode={destination.currency}
                                                                className="size-4 -ml-2 rounded-full border-2 border-white"
                                                            />

                                                        </div>
                                                        <span>Exchange Rate</span>
                                                    </div>
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <Badge className="flex items-center gap-1.5 py-0.5 pl-1 pr-2">
                                                            <FlagIcon
                                                                currencyCode={destination.currency}
                                                                className="size-4"
                                                            />
                                                            {CURRENCIES[destination.currency]?.symbol}
                                                            {CURRENCIES[destination.currency]?.rate}
                                                        </Badge>
                                                    </span>
                                                </div>
                                                {/* <div className="text-xs text-gray-500 flex justify-between">
                                            <span>Mid-market rate</span>
                                            <span>{(paymentDetails.fx.rate * (1 - paymentDetails.fx.margin / 100)).toFixed(2)} {paymentDetails.recipient.bankingDetails.currency.symbol}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>FX Margin ({paymentDetails.fx.margin}%)</span>
                                            <span>+ {(paymentDetails.fx.rate * (paymentDetails.fx.margin / 100)).toFixed(2)} {paymentDetails.recipient.bankingDetails.currency.symbol}</span>
                                        </div> */}
                                            </div>

                                            {/* Fees */}
                                            {/* <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Processing fee (0.1%)</span>
                                            <span className="font-medium">
                                                ${paymentDetails.fees.processingFee.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service charge</span>
                                            <span className="font-medium">
                                                ${paymentDetails.fees.serviceCharge.toFixed(2)}
                                            </span>
                                        </div>
                                    </div> */}

                                            <Separator />

                                            {/* Total */}
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Total cost</span>
                                                <span className="flex items-center gap-1">
                                                    ${(Number(amount) * (1 + CASH_OUT_FEE)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Right */}
                                <div className="space-y-6">
                                    <div className="pl-3">
                                        <div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Estimated delivery progress
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            {/* Timeline steps */}
                                            <div className="relative pl-8 border-l-2 border-[#4ab3e8] pb-6">
                                                <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full bg-[#4ab3e8]" />
                                                <div>
                                                    <p className="font-medium text-sm">Payment Initiated</p>
                                                    <p className="text-xs text-gray-500">Today</p>
                                                </div>
                                            </div>

                                            <div className="relative pl-8 border-l-2 border-gray-200 pb-6">
                                                {isSubmitting ?
                                                    <LoadingSpinner className="size-4 absolute left-0 -translate-x-[5px] p-2 bg-white pt-2 pb-0" /> :
                                                    <div className={cn(
                                                        "border-gray-200 bg-white absolute left-0 -translate-x-[9px] size-4 rounded-full border-2 transition-all duration-300",
                                                    )} />}
                                                <div>
                                                    <p className="font-medium text-sm">Processing</p>
                                                    <p className="text-xs text-gray-500">Within 24 hours</p>
                                                </div>
                                            </div>

                                            <div className="relative pl-8 border-l-2 border-transparent">
                                                <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full border-2 border-gray-200 bg-white" />
                                                <div>
                                                    <p className="font-medium text-sm">Expected Delivery</p>
                                                    <p className="text-xs text-gray-500 mt-1">1-2 business days</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        To {destination.bank_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional info */}
                                        {/* <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">
                                        Note: Delivery times are estimates and may vary based on the receiving bank's processing times and local banking hours.
                                    </p>
                                </div> */}
                                    </div>
                                </div>

                            </div>


                            {/* Action Buttons */}
                            <div className="flex items-center justify-end">

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={() => router.back()} className="gap-2 text-xs">
                                        <Edit2 className="size-4" />
                                        Change Account
                                    </Button>
                                    <Button onClick={handleSubmit} className="gap-2">
                                        Withdraw
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
}