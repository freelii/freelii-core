import { Badge, Button, HoverCard, HoverCardContent, HoverCardTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@freelii/ui";
import { cn } from "@freelii/utils/functions";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Building2, CheckCircle2, Clock, CreditCard, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FlagIcon } from "../shared/flag-icon";

export type BankingDetails = {
    id: string
    name: string
    accountNumber: string
    routingNumber: string
    bankName: string
    bankAddress: string
    bankCity: string
    bankState: string
    bankZip: string
    currency: {
        shortName: string
        symbol: string
        name: string
        flag: string
    }
}

export type Recipient = {
    id: number
    isVerified: boolean
    name: string
    email: string
    notes?: string
    bankingDetails?: BankingDetails
    recipientType: string
}

export const columns: ColumnDef<Recipient>[] = [
    {
        accessorKey: "name",
        header: "Contact",
        cell: ({ row }) => {
            const recipient = row.original
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div>{recipient.name}</div>
                        {recipient.isVerified ? (
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-help">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span className="text-xs">Verified</span>
                                    </Badge>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 bg-white shadow-lg border border-gray-200 z-50">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-green-50 p-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-700" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">Verified Recipient</h4>
                                                <p className="text-xs text-gray-500">This recipient has completed all verification steps</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <CheckCircle2 className="h-3 w-3 text-green-700" />
                                                <span>Email verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <CheckCircle2 className="h-3 w-3 text-green-700" />
                                                <span>Identity verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <CheckCircle2 className="h-3 w-3 text-green-700" />
                                                <span>Banking details verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        ) : (
                            <Badge className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">Pending</span>
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">{recipient.email}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "recipientType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.recipientType
            return (
                <Badge
                    className={cn(
                        "flex items-center gap-1",
                        type === 'business'
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    )}
                >
                    {type === 'business' ? (
                        <Building2 className="h-3 w-3" />
                    ) : (
                        <UserPlus className="h-3 w-3" />
                    )}
                    <span className="text-xs capitalize">{type}</span>
                </Badge>
            )
        },
    },
    {
        accessorKey: "bankingDetails",
        header: "Banking Details",
        cell: ({ row }) => {
            const bankingDetails = row.original.bankingDetails
            if (!bankingDetails) {
                return (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Not provided</span>
                    </div>
                )
            }

            return (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <div className="text-sm font-medium flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            {bankingDetails.bankName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            {bankingDetails?.currency && (
                                <FlagIcon
                                    currencyCode={bankingDetails.currency.shortName}
                                    size={16}
                                />
                            )}
                            {bankingDetails?.currency?.name}
                        </div>
                    </div>
                </div>
            )
        },
    }
];

interface RecipientsTableProps {
    recipients: Recipient[]
    loading?: boolean
    selectedRecipient?: Recipient | null
    onRecipientSelect?: (recipient: Recipient | null) => void
    searchQuery?: string
}

export function RecipientsTable({
    recipients,
    loading = false,
    selectedRecipient,
    onRecipientSelect,
    searchQuery = "",
}: RecipientsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

    const TableComponent = useReactTable({
        data: recipients,
        columns,
        getRowId: (row) => row.id.toString(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        enableRowSelection: true,
    })


    return (
        <Table className="border-none relative">
            <TableHeader className="border-none">
                {TableComponent.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="text-xs font-medium p-1">
                                <>{header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}</>
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody className="border-none">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                            <TableCell className="p-1 w-[40px]">
                                <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                            </TableCell>
                            <TableCell className="p-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </TableCell>
                            <TableCell className="p-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : TableComponent.getRowModel().rows?.length ? (
                    TableComponent.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className={cn(
                                "cursor-pointer hover:bg-gray-50 relative",
                                selectedRecipient?.id === row.original.id && "rounded-full bg-gray-50 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-gray-200",
                            )}
                            onClick={() => onRecipientSelect?.(row.original)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="font-normal text-xs p-1">
                                    <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="h-96 text-center"
                        >
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="rounded-full bg-gray-100 p-3">
                                    <Building2 className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="font-medium text-gray-900">{(searchQuery) ? "No recipients found" : "No recipients yet"}</p>
                                <p className="text-sm text-gray-500">{(searchQuery) ? "Add a new recipient to get started." : "Get started by adding your first recipient."}</p>
                                <Button
                                    className="mt-4 text-xs font-medium bg-black text-white hover:bg-neutral-900"
                                >
                                    <Link href="/dashboard/recipients/new">
                                        Add recipient
                                    </Link>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}