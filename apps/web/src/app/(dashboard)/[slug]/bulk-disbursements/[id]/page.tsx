"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { FlagIcon } from "@/ui/shared/flag-icon"
import {
    Badge,
    BlurImage,
    Button,
    useRouterStuff
} from "@freelii/ui"
import { CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, cn } from "@freelii/utils"
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    DollarSign,
    Download,
    ExternalLink,
    RefreshCw,
    Users,
    XCircle
} from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

export default function BulkDisbursementDetailPage() {
    const { router } = useRouterStuff()
    const params = useParams()
    const disbursementId = params?.id as string
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Fetch bulk disbursement details
    const { data: disbursement, isFetching: loading, refetch } = api.bulkDisbursement.getById.useQuery({
        id: disbursementId
    }, {
        enabled: !!disbursementId
    })

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refetch()
            toast.success("Disbursement data refreshed")
        } catch (error) {
            ClientTRPCErrorHandler(error as any)
        } finally {
            setIsRefreshing(false)
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 font-medium">Completed</Badge>
            case 'PROCESSING':
                return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Processing</Badge>
            case 'PARTIALLY_COMPLETED':
                return <Badge variant="default" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">Partially Completed</Badge>
            case 'FAILED':
                return <Badge variant="default" className="bg-red-50 text-red-700 border-red-200 font-medium">Failed</Badge>
            case 'CANCELLED':
                return <Badge variant="default" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">Cancelled</Badge>
            default:
                return <Badge variant="default" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">Pending</Badge>
        }
    }

    const getItemStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 text-xs font-medium">Completed</Badge>
            case 'PROCESSING':
                return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">Processing</Badge>
            case 'FAILED':
                return <Badge variant="default" className="bg-red-50 text-red-700 border-red-200 text-xs font-medium">Failed</Badge>
            case 'CANCELLED':
                return <Badge variant="default" className="bg-gray-50 text-gray-700 border-gray-200 text-xs font-medium">Cancelled</Badge>
            default:
                return <Badge variant="default" className="bg-gray-50 text-gray-700 border-gray-200 text-xs font-medium">Pending</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />
            case 'PROCESSING':
                return <Clock className="h-5 w-5 text-blue-600" />
            case 'PARTIALLY_COMPLETED':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />
            case 'FAILED':
                return <XCircle className="h-5 w-5 text-red-600" />
            case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-gray-600" />
            default:
                return <Clock className="h-5 w-5 text-gray-400" />
        }
    }

    const getItemStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case 'PROCESSING':
                return <Clock className="h-4 w-4 text-blue-600" />
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-600" />
            case 'CANCELLED':
                return <XCircle className="h-4 w-4 text-gray-600" />
            default:
                return <Clock className="h-4 w-4 text-gray-400" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/30">
                <div className="max-w-6xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="px-8 py-6 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Status Card Skeleton */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-6 bg-gray-200 rounded w-32" />
                                <div className="h-6 bg-gray-200 rounded w-20" />
                            </div>
                            <div className="grid grid-cols-4 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-8 bg-gray-200 rounded w-16" />
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recipients Skeleton */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32" />
                                            <div className="h-3 bg-gray-200 rounded w-24" />
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!disbursement) {
        return (
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Disbursement not found</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        The disbursement you're looking for doesn't exist or you don't have access to it.
                    </p>
                    <Button
                        onClick={() => router.push("/dashboard/bulk-disbursements")}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                    >
                        Back to disbursements
                    </Button>
                </div>
            </div>
        )
    }

    const disbursementData = disbursement as any
    const completedItems = disbursementData.items?.filter((item: any) => item.status === 'COMPLETED') || []
    const failedItems = disbursementData.items?.filter((item: any) => item.status === 'FAILED') || []
    const processingItems = disbursementData.items?.filter((item: any) => item.status === 'PROCESSING') || []
    const pendingItems = disbursementData.items?.filter((item: any) => item.status === 'PENDING') || []

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/dashboard/bulk-disbursements")}
                                className="p-2 hover:bg-gray-50 rounded-lg"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(disbursementData.status)}
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                                        Bulk disbursement
                                    </h1>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Created {new Date(disbursementData.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                            >
                                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                                Refresh
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => copyToClipboard(disbursementData.id, "Disbursement ID")}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                            >
                                <Copy className="h-4 w-4" />
                                Copy ID
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Status Overview */}
                    <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-gray-900">Overview</h2>
                                {getStatusBadge(disbursementData.status)}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mx-auto mb-3">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                                        {disbursementData.total_recipients}
                                    </div>
                                    <div className="text-sm text-gray-500">Recipients</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mx-auto mb-3">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                                        ${(disbursementData.total_amount_usd / 100).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                    <div className="text-sm text-gray-500">Total amount</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-lg mx-auto mb-3">
                                        <CheckCircle2 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                                        {completedItems.length}
                                    </div>
                                    <div className="text-sm text-gray-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-3">
                                        <Calendar className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div className="text-2xl font-semibold text-gray-900 mb-1">
                                        {new Set(disbursementData.items?.map((item: any) => item.target_currency) || []).size}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Set(disbursementData.items?.map((item: any) => item.target_currency) || []).size === 1 ? 'Currency' : 'Currencies'}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {disbursementData.items && disbursementData.items.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm text-gray-500">
                                            {completedItems.length} of {disbursementData.items.length} completed
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(completedItems.length / disbursementData.items.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-4">
                                            {completedItems.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                                                    <span>{completedItems.length} completed</span>
                                                </div>
                                            )}
                                            {processingItems.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                                    <span>{processingItems.length} processing</span>
                                                </div>
                                            )}
                                            {failedItems.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                                                    <span>{failedItems.length} failed</span>
                                                </div>
                                            )}
                                            {pendingItems.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                                    <span>{pendingItems.length} pending</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Disbursement Details */}
                    <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-sm font-medium text-gray-900">Details</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Disbursement ID</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <code className="text-sm bg-gray-50 px-2 py-1 rounded border font-mono">
                                                {disbursementData.id}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                onClick={() => copyToClipboard(disbursementData.id, "Disbursement ID")}
                                                className="p-1 hover:bg-gray-50 rounded"
                                            >
                                                <Copy className="h-3 w-3 text-gray-400" />
                                            </Button>
                                        </div>
                                    </div>
                                    {disbursementData.reference && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Reference</label>
                                            <p className="mt-1 text-sm text-gray-900">{disbursementData.reference}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Created</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(disbursementData.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZoneName: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {disbursementData.initiated_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Initiated</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(disbursementData.initiated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZoneName: 'short'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {disbursementData.completed_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Completed</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(disbursementData.completed_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZoneName: 'short'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {disbursementData.failed_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Failed</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(disbursementData.failed_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZoneName: 'short'
                                                })}
                                            </p>
                                            {disbursementData.failed_reason && (
                                                <p className="mt-1 text-sm text-red-600">{disbursementData.failed_reason}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipients List */}
                    <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-gray-900">Recipients</h2>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                    >
                                        <Download className="h-3 w-3" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {disbursementData.items?.map((item: any, index: number) => (
                                <div key={item.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        {/* Recipient Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="relative flex-shrink-0">
                                                <BlurImage
                                                    src={`${DICEBEAR_SOLID_AVATAR_URL}${item.recipient.name}`}
                                                    width={48}
                                                    height={48}
                                                    alt={item.recipient.name}
                                                    className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                                                />
                                                {item.recipient.verification_status === "VERIFIED" && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                        {item.recipient.name}
                                                    </h3>
                                                    {item.recipient.verification_status === "VERIFIED" && (
                                                        <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium">
                                                            Verified
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                    <span className="truncate">{item.recipient.email}</span>
                                                    {item.recipient.payment_destinations?.[0]?.fiat_account?.bank_name && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <FlagIcon currencyCode={item.target_currency} className="w-3 h-3" />
                                                                <span>{item.recipient.payment_destinations[0].fiat_account.bank_name}</span>
                                                                {item.recipient.payment_destinations[0].fiat_account.account_number && (
                                                                    <span>•••{item.recipient.payment_destinations[0].fiat_account.account_number.slice(-4)}</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getItemStatusIcon(item.status)}
                                                    {getItemStatusBadge(item.status)}
                                                    {item.processed_at && (
                                                        <span className="text-xs text-gray-500">
                                                            • Processed {new Date(item.processed_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {item.failed_reason && (
                                                        <span className="text-xs text-red-600">
                                                            • {item.failed_reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount Info */}
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <div className="text-sm font-semibold text-gray-900 mb-1">
                                                ${(item.amount_usd / 100).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </div>
                                            {item.target_currency !== "USD" && (
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {CURRENCIES[item.target_currency]?.symbol}
                                                    {(item.target_amount / 100).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })} {item.target_currency}
                                                </div>
                                            )}
                                            {item.payment_orchestration_id && (
                                                <Button
                                                    variant="ghost"
                                                    className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                                                    onClick={() => router.push(`/dashboard/payouts/${item.payment_orchestration_id}`)}
                                                >
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    View transaction
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <div className="px-6 py-12 text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500">No recipients found</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 