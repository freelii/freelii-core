import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler";
import { api } from "@/trpc/react";
import { Badge, Button, Checkbox, HoverCard, HoverCardContent, HoverCardTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@freelii/ui";
import { cn } from "@freelii/utils/functions";
import {
    Address, BlockchainAccount,
    Client,
    EwalletAccount,
    FiatAccount,
    PaymentDestination,
    RecipientType,
    VerificationStatus
} from "@prisma/client";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Archive, Building2, CheckCircle2, Clock, CreditCard, Send, Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FlagIcon } from "../shared/flag-icon";



export type Recipient = Client & {
    address?: Address | null
    payment_destinations?: (PaymentDestination & {
        id: string;
        fiat_account: FiatAccount | null;
        blockchain_account: BlockchainAccount | null;
        ewallet_account: EwalletAccount | null;
    })[]
}

const getPaymentMethodLabel = (destination: PaymentDestination & {
    ewallet_account?: EwalletAccount | null,
    blockchain_account?: BlockchainAccount | null,
    fiat_account?: FiatAccount | null
}) => {
    switch (destination.payment_rail) {
        case 'STELLAR':
            return destination.blockchain_account ? 'Stellar' : 'Unknown'
        case 'PH_INSTAPAY':
        case 'PH_PESONET':
            if (destination.ewallet_account?.ewallet_provider) {
                return destination.ewallet_account.ewallet_provider.replace('PH_', '')
            }
            if (destination.fiat_account) {
                return destination.fiat_account.bank_name ?? 'Bank Transfer'
            }
            return 'Bank Transfer'
        case 'WIRE':
            return destination.fiat_account?.bank_name ?? 'Wire Transfer'
        case 'ACH':
            return destination.fiat_account?.bank_name ?? 'ACH'
        case 'SEPA':
            return destination.fiat_account?.bank_name ?? 'SEPA'
        case 'MX_SPEI':
            return destination.fiat_account?.bank_name ?? 'SPEI'
        default:
            return 'Unknown'
    }
}

const getPaymentMethodFlag = (destination: PaymentDestination) => {
    return destination.currency
}

const getPaymentMethodDescription = (destination: PaymentDestination & {
    ewallet_account?: EwalletAccount | null,
    fiat_account?: FiatAccount | null
}) => {
    if (destination.ewallet_account?.mobile_number) {
        return destination.ewallet_account.mobile_number
    }
    if (destination.fiat_account?.account_number) {
        return `****${destination.fiat_account.account_number.slice(-4)}`
    }
    return destination.currency
}

const getAverageTransferTime = (destination: PaymentDestination) => {
    switch (destination.payment_rail) {
        case 'STELLAR':
            return 'Instant'
        case 'PH_INSTAPAY':
            return '~15 minutes'
        case 'PH_PESONET':
            return '~2 hours'
        case 'WIRE':
            return '2-3 business days'
        case 'ACH':
            return '1-2 business days'
        case 'SEPA':
            return '1 business day'
        default:
            return 'Varies'
    }
}

const PaymentMethod = ({ destination, defaultCollapsed = true }: {
    destination: PaymentDestination & {
        ewallet_account?: EwalletAccount | null,
        blockchain_account?: BlockchainAccount | null,
        fiat_account?: FiatAccount | null
    },
    defaultCollapsed?: boolean
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-full border border-gray-200 w-fit group px-1 py-1">
                    <FlagIcon
                        currencyCode={getPaymentMethodFlag(destination)}
                        size={16}
                    />
                    <span className={cn(
                        "text-xs font-medium",
                        !defaultCollapsed && "hidden group-hover:block"
                    )}>
                        {getPaymentMethodLabel(destination)}
                    </span>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-white shadow-lg border border-gray-200 z-50">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <FlagIcon
                            currencyCode={getPaymentMethodFlag(destination)}
                            className="w-6 h-6"
                            size={20}
                        />
                        <div>
                            <h4 className="text-sm font-medium">{getPaymentMethodLabel(destination)}</h4>
                            <p className="text-xs text-gray-500">{getPaymentMethodDescription(destination)}</p>
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
                            <span className="font-medium">{getAverageTransferTime(destination)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Success rate</span>
                            <span className="font-medium text-green-600">100%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md mt-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">Added on {dayjs(destination.created_at).format('MMMM D, YYYY')}</span>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}

export const columns: ColumnDef<Recipient>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                onClick={(e) => e.stopPropagation()}
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
            const allAccounts = recipient.payment_destinations ?? [];
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
                    <PaymentMethod destination={allAccounts[0]!} />
                )
            } else {
                return (
                    <div className="flex flex-wrap gap-1">
                        {allAccounts.map((account) => (
                            <PaymentMethod key={account.id} destination={account} defaultCollapsed={false} />
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

interface FloatingActionsBarProps {
    selectedCount: number;
    onClose: () => void;
    onArchive: () => void;
}

const FloatingActionsBar = ({ selectedCount, onClose, onArchive }: FloatingActionsBarProps) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-center gap-6 z-50">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                    {selectedCount}
                </div>
                <span className="text-sm text-gray-600">recipients selected</span>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={async () => {
                        // Handle send verification amount
                        const id = toast.loading('Sending verification amount...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        toast.dismiss(id)
                        toast.success('Verification amount sent!', { id })
                        onClose();
                    }}
                >
                    <Send className="h-4 w-4" />
                    Send verification amount
                </Button>

                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onArchive}
                >
                    <Archive className="h-4 w-4" />
                    Archive
                </Button>

                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                        // Handle request KYC/KYB
                    }}
                >
                    <Shield className="h-4 w-4" />
                    Request KYC/KYB
                </Button>

                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                        // Handle send next payment
                    }}
                >
                    <CreditCard className="h-4 w-4" />
                    Send next payment
                </Button>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-500"
            >
                Cancel
            </Button>
        </div>
    )
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


    // tRPC procedures
    const utils = api.useUtils()
    const { mutateAsync: archiveMany } = api.clients.archiveMany.useMutation({
        onSuccess: () => {
            toast.success('Recipients archived!')
            void utils.clients.invalidate()
        },
        onError: ClientTRPCErrorHandler
    })

    const handleArchiveMany = async () => {
        const id = toast.loading('Archiving recipients...')
        await archiveMany(Object.keys(rowSelection).map(Number)).finally(() => {
            toast.dismiss(id)
            setRowSelection({})
        })
    }

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

    const selectedRows = Object.keys(rowSelection).length;

    return (
        <>
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

            {selectedRows > 0 && (
                <FloatingActionsBar
                    selectedCount={selectedRows}
                    onClose={() => setRowSelection({})}
                    onArchive={handleArchiveMany}
                />
            )}
        </>
    )
}