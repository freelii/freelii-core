"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { type Recipient } from "@/ui/recipients-table/recipients-table"
import { FlagIcon } from "@/ui/shared/flag-icon"
import {
    Badge,
    BlurImage,
    Button,
    Input,
    useRouterStuff
} from "@freelii/ui"
import { cn, CURRENCIES, DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils"
import { fromUSD } from "@freelii/utils/functions"
import { ArrowLeft, CheckCircle2, Edit3, Plus, Search, X } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

interface DisbursementItem {
    recipient: Recipient
    amount: string // USD amount
}

export default function BulkDisbursementsPage() {
    const { router } = useRouterStuff()
    const [searchQuery, setSearchQuery] = useState("")
    const [disbursements, setDisbursements] = useState<DisbursementItem[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    // Fetch recipients
    const { data: recipients, isFetching: loadingRecipients } = api.clients.search.useQuery({
        query: searchQuery,
        page: 1,
        limit: 50
    })

    // Filter out recipients that are already added
    const availableRecipients = recipients?.filter(
        recipient => !disbursements.some(d => d.recipient.id === recipient.id)
    ) ?? []

    const addRecipient = (recipient: Recipient) => {
        setDisbursements(prev => [...prev, { recipient, amount: "" }])
    }

    const removeRecipient = (recipientId: number) => {
        setDisbursements(prev => prev.filter(d => d.recipient.id !== recipientId))
    }

    const updateAmount = (recipientId: number, amount: string) => {
        setDisbursements(prev =>
            prev.map(d =>
                d.recipient.id === recipientId
                    ? { ...d, amount }
                    : d
            )
        )
    }

    const getTotalUSD = () => {
        return disbursements.reduce((total, d) => total + (parseFloat(d.amount) || 0), 0)
    }

    const getRecipientCurrency = (recipient: Recipient) => {
        // Get currency from payment destinations
        const paymentDestination = recipient.payment_destinations?.[0]
        if (paymentDestination?.fiat_account) {
            // Determine currency based on country or bank
            const address = recipient.address
            if (address?.country === "Philippines") return "PHP"
            if (address?.country === "Mexico") return "MXN"
            if (address?.country === "Canada") return "CAD"
            if (address?.country === "United Kingdom") return "GBP"
            if (address?.country === "European Union") return "EUR"
            if (address?.country === "Hong Kong") return "HKD"
            if (address?.country === "Singapore") return "SGD"
        }
        return "USD" // Default to USD
    }

    const getConvertedAmount = (usdAmount: string, recipientCurrency: string) => {
        const amount = parseFloat(usdAmount) || 0
        if (recipientCurrency === "USD") return amount
        return fromUSD(amount, recipientCurrency)
    }

    const handlePreview = () => {
        if (disbursements.length === 0) {
            toast.error("Please add at least one recipient")
            return
        }

        const invalidDisbursements = disbursements.filter(d => !d.amount || parseFloat(d.amount) <= 0)
        if (invalidDisbursements.length > 0) {
            toast.error("Please enter valid amounts for all recipients")
            return
        }

        setShowPreview(true)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Here you would call the bulk disbursement API
            // For now, we'll just show a success message
            toast.success(`Bulk disbursement initiated for ${disbursements.length} recipients`)
            router.push("/dashboard/payouts")
        } catch (error) {
            ClientTRPCErrorHandler(error as any)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (showPreview) {
        return (
            <div className="min-h-screen bg-gray-50/30">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="px-8 py-6 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-50 rounded-lg"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                                    Review disbursement
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Verify details before sending payments
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Summary Stats */}
                        <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-sm font-medium text-gray-900">Summary</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <div className="text-2xl font-semibold text-gray-900 mb-1">{disbursements.length}</div>
                                        <div className="text-sm text-gray-500">Recipients</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-semibold text-gray-900 mb-1">
                                            ${getTotalUSD().toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                        <div className="text-sm text-gray-500">Total amount</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-semibold text-gray-900 mb-1">
                                            {new Set(disbursements.map(d => getRecipientCurrency(d.recipient))).size}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Set(disbursements.map(d => getRecipientCurrency(d.recipient))).size === 1 ? 'Currency' : 'Currencies'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recipients List */}
                        <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-sm font-medium text-gray-900">Recipients</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {disbursements.map((disbursement, index) => {
                                    const recipientCurrency = getRecipientCurrency(disbursement.recipient)
                                    const convertedAmount = getConvertedAmount(disbursement.amount, recipientCurrency)

                                    return (
                                        <div key={disbursement.recipient.id} className="px-6 py-5">
                                            <div className="flex items-center justify-between">
                                                {/* Recipient Info */}
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="relative flex-shrink-0">
                                                        <BlurImage
                                                            src={`${DICEBEAR_SOLID_AVATAR_URL}${disbursement.recipient.name}`}
                                                            width={40}
                                                            height={40}
                                                            alt={disbursement.recipient.name}
                                                            className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                                                        />
                                                        {disbursement.recipient.verification_status === "VERIFIED" && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                                                <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                {disbursement.recipient.name}
                                                            </h3>
                                                            {disbursement.recipient.verification_status === "VERIFIED" && (
                                                                <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium">
                                                                    Verified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span className="truncate">{disbursement.recipient.email}</span>
                                                            {disbursement.recipient.payment_destinations?.[0]?.fiat_account?.bank_name && (
                                                                <>
                                                                    <span className="text-gray-300">•</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <FlagIcon currencyCode={recipientCurrency} className="w-3 h-3" />
                                                                        <span>{disbursement.recipient.payment_destinations[0].fiat_account.bank_name}</span>
                                                                        {disbursement.recipient.payment_destinations[0].fiat_account.account_number && (
                                                                            <span>•••{disbursement.recipient.payment_destinations[0].fiat_account.account_number.slice(-4)}</span>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Amount Info */}
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">
                                                        ${parseFloat(disbursement.amount).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </div>
                                                    {recipientCurrency !== "USD" && (
                                                        <div className="text-xs text-gray-500">
                                                            {CURRENCIES[recipientCurrency]?.symbol}
                                                            {convertedAmount.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })} {recipientCurrency}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setShowPreview(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit disbursement
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                    "px-8 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    "bg-gray-900 hover:bg-gray-800 text-white",
                                    "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    `Send ${disbursements.length} payment${disbursements.length === 1 ? '' : 's'}`
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="px-8 py-8 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard/payouts")}
                            className="p-2 hover:bg-gray-50 rounded-lg"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                New bulk disbursement
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Send payments to multiple recipients at once
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left Side - Add Recipients */}
                        <div className="col-span-5">
                            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-medium text-gray-900">Add recipients</h2>
                                            <p className="text-sm text-gray-500 mt-1">Search and select recipients for your disbursement</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => router.push("/dashboard/recipients/new")}
                                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1 w-fit py-1.5 rounded-md font-medium"
                                        >
                                            + Add new
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Search */}
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search recipients..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                                        />
                                    </div>

                                    {/* Recipients List */}
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {loadingRecipients ? (
                                            <div className="space-y-3">
                                                {Array.from({ length: 4 }).map((_, i) => (
                                                    <div key={i} className="p-4 rounded-lg animate-pulse">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                                            <div className="flex-1 space-y-2">
                                                                <div className="h-4 bg-gray-200 rounded w-32" />
                                                                <div className="h-3 bg-gray-200 rounded w-24" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : availableRecipients.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {searchQuery ? "No recipients found" : "No recipients available"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {searchQuery ? "Try adjusting your search" : "Add recipients to get started"}
                                                </p>
                                            </div>
                                        ) : (
                                            availableRecipients.map((recipient) => {
                                                const recipientCurrency = getRecipientCurrency(recipient)
                                                return (
                                                    <div
                                                        key={recipient.id}
                                                        className="group relative p-4 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-200 border border-gray-100/50 hover:border-gray-200 hover:shadow-sm"
                                                        onClick={() => addRecipient(recipient)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex-shrink-0">
                                                                <BlurImage
                                                                    src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                                                                    width={48}
                                                                    height={48}
                                                                    alt={recipient.name}
                                                                    className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm"
                                                                />
                                                                {recipient.verification_status === "VERIFIED" && (
                                                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                        {recipient.name}
                                                                    </h3>
                                                                    {recipient.verification_status === "VERIFIED" && (
                                                                        <Badge variant="default" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium">
                                                                            Verified
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500 truncate mb-2">
                                                                    {recipient.email}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
                                                                        <FlagIcon currencyCode={recipientCurrency} className="w-3 h-3" />
                                                                        <span className="text-xs font-medium text-gray-700">{recipientCurrency}</span>
                                                                    </div>
                                                                    {recipient.payment_destinations?.[0]?.fiat_account?.bank_name && (
                                                                        <div className="text-xs text-gray-400 truncate">
                                                                            {recipient.payment_destinations[0].fiat_account.bank_name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                                                    <Plus className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Disbursement Details */}
                        <div className="col-span-7">
                            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-medium text-gray-900">Disbursement details</h2>
                                    <p className="text-sm text-gray-500 mt-1">Configure amounts for each recipient</p>
                                </div>

                                <div className="p-6">
                                    {disbursements.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Plus className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">No recipients selected</h3>
                                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                                Select recipients from the left panel to start configuring your disbursement
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Recipients with amounts */}
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto mb-6">
                                                {disbursements.map((disbursement, index) => {
                                                    const recipientCurrency = getRecipientCurrency(disbursement.recipient)
                                                    const convertedAmount = getConvertedAmount(disbursement.amount, recipientCurrency)

                                                    return (
                                                        <div key={disbursement.recipient.id} className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 bg-white hover:bg-gray-50/30">
                                                            {/* Main Row */}
                                                            <div className="flex items-center gap-4">
                                                                {/* Recipient Info */}
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className="relative flex-shrink-0">
                                                                        <BlurImage
                                                                            src={`${DICEBEAR_SOLID_AVATAR_URL}${disbursement.recipient.name}`}
                                                                            width={32}
                                                                            height={32}
                                                                            alt={disbursement.recipient.name}
                                                                            className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                                                                        />
                                                                        {disbursement.recipient.verification_status === "VERIFIED" && (
                                                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center ring-1 ring-white">
                                                                                <CheckCircle2 className="h-2 w-2 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                                {disbursement.recipient.name}
                                                                            </h3>
                                                                            {disbursement.recipient.verification_status === "VERIFIED" && (
                                                                                <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium">
                                                                                    ✓
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                {disbursement.recipient.email}
                                                                            </p>
                                                                            <span className="text-gray-300">•</span>
                                                                            <div className="flex items-center gap-1">
                                                                                <FlagIcon currencyCode={recipientCurrency} className="w-3 h-3" />
                                                                                <span className="text-xs text-gray-600">{recipientCurrency}</span>
                                                                            </div>
                                                                            {disbursement.recipient.payment_destinations?.[0]?.fiat_account?.bank_name && (
                                                                                <>
                                                                                    <span className="text-gray-300">•</span>
                                                                                    <span className="text-xs text-gray-500 truncate">
                                                                                        {disbursement.recipient.payment_destinations[0].fiat_account.bank_name}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Amount Inputs */}
                                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                                    {/* USD Amount Input */}
                                                                    <div className="w-28">
                                                                        <div className="relative">
                                                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="0.00"
                                                                                value={disbursement.amount}
                                                                                onChange={(e) => updateAmount(disbursement.recipient.id, e.target.value)}
                                                                                className="pl-5 pr-2 py-1.5 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-md h-8"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Converted Amount Display */}
                                                                    <div className="w-32">
                                                                        <div className="h-8 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                                                                            {disbursement.amount && parseFloat(disbursement.amount) > 0 ? (
                                                                                <div className="flex items-center gap-1.5 text-xs w-full">
                                                                                    <FlagIcon currencyCode={recipientCurrency} className="w-3 h-3 flex-shrink-0" />
                                                                                    <span className="font-medium text-gray-900 truncate">
                                                                                        {CURRENCIES[recipientCurrency]?.symbol}
                                                                                        {convertedAmount.toLocaleString('en-US', {
                                                                                            minimumFractionDigits: 0,
                                                                                            maximumFractionDigits: 0
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400">—</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Remove Button */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => removeRecipient(disbursement.recipient.id)}
                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md h-8 w-8"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Exchange Rate (if applicable) */}
                                                            {disbursement.amount && parseFloat(disbursement.amount) > 0 && recipientCurrency !== "USD" && (
                                                                <div className="mt-2 ml-11 text-xs text-gray-500">
                                                                    1 USD = {CURRENCIES[recipientCurrency]?.symbol}{CURRENCIES[recipientCurrency]?.rate} {recipientCurrency}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {/* Summary */}
                                            <div className="border-t border-gray-100 pt-6">
                                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-gray-600">Recipients</span>
                                                        <span className="text-sm font-medium text-gray-900">{disbursements.length}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total amount</span>
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            ${getTotalUSD().toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })} USD
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Preview Button */}
                                                <Button
                                                    onClick={handlePreview}
                                                    disabled={disbursements.length === 0 || disbursements.some(d => !d.amount || parseFloat(d.amount) <= 0)}
                                                    className={cn(
                                                        "w-full h-11 text-sm font-medium rounded-lg transition-all duration-200",
                                                        "bg-gray-900 hover:bg-gray-800 text-white",
                                                        "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    Preview disbursement
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 