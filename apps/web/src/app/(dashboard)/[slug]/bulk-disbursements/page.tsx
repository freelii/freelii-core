"use client"

import { api } from "@/trpc/react"
import {
    Badge,
    BlurImage,
    Button,
    useRouterStuff
} from "@freelii/ui"
import { DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils"
import { CheckCircle2, Clock, Plus, XCircle } from "lucide-react"
import { useState } from "react"

export default function BulkDisbursementsListPage() {
    const { router } = useRouterStuff()
    const [limit] = useState(10)
    const [offset] = useState(0)

    // Fetch bulk disbursements
    const { data: bulkDisbursements, isFetching: loading } = api.bulkDisbursement.getAll.useQuery({
        limit,
        offset
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
            case 'PROCESSING':
                return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
            case 'PARTIALLY_COMPLETED':
                return <Badge variant="default" className="bg-yellow-50 text-yellow-700 border-yellow-200">Partial</Badge>
            case 'FAILED':
                return <Badge variant="default" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
            case 'CANCELLED':
                return <Badge variant="default" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>
            default:
                return <Badge variant="default" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case 'PROCESSING':
                return <Clock className="h-4 w-4 text-blue-600" />
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <Clock className="h-4 w-4 text-gray-400" />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="px-8 py-8 bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Bulk disbursements
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage your bulk payment disbursements
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push("/dashboard/bulk-disbursements/new")}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                        >
                            <Plus className="h-4 w-4" />
                            New disbursement
                        </Button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32" />
                                            <div className="h-3 bg-gray-200 rounded w-24" />
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !bulkDisbursements || bulkDisbursements.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk disbursements yet</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Create your first bulk disbursement to send payments to multiple recipients at once
                            </p>
                            <Button
                                onClick={() => router.push("/dashboard/bulk-disbursements/new")}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Create disbursement
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bulkDisbursements.map((disbursement: any) => (
                                <div
                                    key={disbursement.id}
                                    className="bg-white rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer hover:border-gray-300"
                                    onClick={() => router.push(`/dashboard/bulk-disbursements/${disbursement.id}`)}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(disbursement.status)}
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        Bulk disbursement
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(disbursement.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(disbursement.status)}
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 mb-4">
                                            <div>
                                                <div className="text-2xl font-semibold text-gray-900 mb-1">
                                                    {disbursement.total_recipients}
                                                </div>
                                                <div className="text-sm text-gray-500">Recipients</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-semibold text-gray-900 mb-1">
                                                    ${(disbursement.total_amount_usd / 100).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-500">Total amount</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-semibold text-gray-900 mb-1">
                                                    {new Set(disbursement.items.map((item: any) => item.target_currency)).size}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Set(disbursement.items.map((item: any) => item.target_currency)).size === 1 ? 'Currency' : 'Currencies'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recipients Preview */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Recipients:</span>
                                            <div className="flex items-center gap-2">
                                                {disbursement.items.slice(0, 5).map((item: any, index: number) => (
                                                    <div key={item.id} className="relative">
                                                        <BlurImage
                                                            src={`${DICEBEAR_SOLID_AVATAR_URL}${item.recipient.name}`}
                                                            width={24}
                                                            height={24}
                                                            alt={item.recipient.name}
                                                            className="w-6 h-6 rounded-full ring-2 ring-white"
                                                            style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                                                        />
                                                    </div>
                                                ))}
                                                {disbursement.items.length > 5 && (
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium ring-2 ring-white" style={{ marginLeft: '-8px' }}>
                                                        +{disbursement.items.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 