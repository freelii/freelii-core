"use client"

import {
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@freelii/ui"
import { formatCurrency } from "@freelii/utils/functions"
import { type Client, type Invoice } from "@prisma/client"
import dayjs from "dayjs"

interface InvoicesTableProps {
    invoices?: (Invoice & {
        client?: Client | null
    })[]
    isLoading?: boolean
}

export function InvoicesTable({ invoices = [], isLoading }: InvoicesTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    // Loading state rows
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : invoices.length === 0 ? (
                    // Empty state
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center space-y-1 text-gray-500">
                                <p className="text-sm">No invoices found</p>
                                <p className="text-xs">Create your first invoice to get started</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    // Data rows
                    invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                                {invoice.invoice_number}
                                {invoice.po_number && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        PO: {invoice.po_number}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {invoice.client?.name ?? invoice.issuer_name ?? "N/A"}
                                {(invoice.client?.email ?? invoice.issuer_email) && (
                                    <div className="text-xs text-gray-500">
                                        {invoice.client?.email ?? invoice.issuer_email}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {dayjs(invoice.created_at).format("MMM D, YYYY")}
                            </TableCell>
                            <TableCell>
                                {dayjs(invoice.due_date).format("MMM D, YYYY")}
                            </TableCell>
                            <TableCell>
                                {formatCurrency(invoice.total_amount, invoice.currency)}
                            </TableCell>
                            <TableCell>
                                <InvoiceStatus status={invoice.status} />
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}

function InvoiceStatus({ status }: { status: string }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "overdue":
                return "bg-red-100 text-red-800"
            case "cancelled":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                status
            )}`}
        >
            {status}
        </span>
    )
}