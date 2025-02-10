import { Badge, Button, HoverCard, HoverCardContent, HoverCardTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@freelii/ui";
import { cn } from "@freelii/utils/functions";
import { Address, BlockchainAccount, Client, EwalletAccount, FiatAccount, RecipientType, VerificationStatus } from "@prisma/client";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Building2, CheckCircle2, Clock, CreditCard, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FlagIcon } from "../shared/flag-icon";



export type Recipient = Client & {
    address?: Address | null
    fiat_accounts?: FiatAccount[]
    blockchain_accounts?: BlockchainAccount[]
    ewallet_accounts?: EwalletAccount[]
}

const getPaymentMethodLabel = (account: FiatAccount | EwalletAccount | BlockchainAccount) => {
    if ('network' in account) {
        return 'blockchain'
    }
    // SPEI (Mexico)
    if ('bank_name' in account && account.iso_currency === 'MXN') {
        return 'SPEI'
    }
    // Philippines Bank
    if ('bank_name' in account && account.iso_currency === 'PHP') {
        return account.bank_name
    }
    // E-wallets (Philippines)
    if ('ewallet_provider' in account && account.iso_currency === 'PHP' && account.ewallet_provider) {
        return account.ewallet_provider.replace('PH_', '')
    }
    // Default case
    return 'bank_name' in account ? account.bank_name : account.ewallet_provider?.replace('PH_', '')
}


const getPaymentMethodFlag = (account: FiatAccount | EwalletAccount | BlockchainAccount) => {
    if ('network' in account) {
        return 'USDC-Hardcoded'
    }
    return account.iso_currency
}

const getPaymentMethodDescription = (account: FiatAccount | EwalletAccount | BlockchainAccount) => {
    if ('network' in account) {
        return 'USDC'
    }
    return account.iso_currency
}

const getAverageTransferTime = (account: FiatAccount | EwalletAccount | BlockchainAccount) => {
    if ('network' in account) {
        return 'Instant'
    }
    if (account.iso_currency === 'MXN') {
        return 'less than 1 hour'
    }
    if (account.iso_currency === 'PHP') {
        return '~2 hours'
    }
    return '1-2 days'
}

const PaymentMethod = ({ account, defaultCollapsed = true }: { account: FiatAccount | EwalletAccount | BlockchainAccount, defaultCollapsed?: boolean }) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-full border border-gray-200 w-fit group px-1 py-1">
                    <FlagIcon
                        currencyCode={getPaymentMethodFlag(account)}
                        size={16}
                    />
                    <span className={cn(
                        "text-xs font-medium",
                        !defaultCollapsed && "hidden group-hover:block"
                    )}>
                        {getPaymentMethodLabel(account)}
                    </span>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-white shadow-lg border border-gray-200 z-50">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <FlagIcon
                            currencyCode={getPaymentMethodFlag(account)}
                            className="w-6 h-6"
                            size={20}
                        />
                        <div>
                            <h4 className="text-sm font-medium">{getPaymentMethodLabel(account)}</h4>
                            <p className="text-xs text-gray-500">{getPaymentMethodDescription(account)}</p>
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last transfer</span>
                            <span className="font-medium">2 days ago</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Total transfers</span>
                            <span className="font-medium">24 transfers</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Average transfer time</span>
                            <span className="font-medium">{getAverageTransferTime(account)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Success rate</span>
                            <span className="font-medium text-green-600">100%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md mt-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">Added on {dayjs(account.created_at).format('MMMM D, YYYY')}</span>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
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
                        {recipient.verification_status === VerificationStatus.VERIFIED ? (
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
                            <Badge className="flex items-center gap-1 px-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">Pending verification</span>
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">{recipient.email}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "recipient_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.recipient_type
            return (
                <Badge
                    className={cn(
                        "flex items-center gap-1",
                        type === RecipientType.BUSINESS
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    )}
                >
                    {type === RecipientType.BUSINESS ? (
                        <Building2 className="h-3 w-3" />
                    ) : (
                        <UserPlus className="h-3 w-3" />
                    )}
                    <span className="text-xs capitalize">{type.toLowerCase()}</span>
                </Badge>
            )
        },
    },
    {
        accessorKey: "payment_methods",
        header: "Payment Methods",
        cell: ({ row }) => {
            const recipient = row.original
            const fiatAccounts = recipient.fiat_accounts || []
            const ewalletAccounts = recipient.ewallet_accounts || []
            const blockchainAccounts = recipient.blockchain_accounts || []
            const allAccounts = [...fiatAccounts, ...ewalletAccounts, ...blockchainAccounts]

            if (allAccounts.length === 0) {
                return (
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Not provided</span>
                    </div>
                )
            }



            if (allAccounts.length === 1) {
                return (
                    <PaymentMethod account={allAccounts[0]!} />
                )
            } else {
                return (
                    <div className="flex flex-wrap gap-1">
                        {allAccounts.map((account) => (
                            <PaymentMethod key={account.id} account={account} defaultCollapsed={false} />
                        ))}
                    </div>
                )
            }
        },
    },
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