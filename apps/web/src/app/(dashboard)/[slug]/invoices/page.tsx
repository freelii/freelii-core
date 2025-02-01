"use client"

import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { Button, Input, MaxWidthWrapper } from "@freelii/ui"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { InvoicesTable } from "./invoices-table"

function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export default function InvoicesPage() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const debouncedQuery = useDebounce(query)
    const { data: invoices, isLoading } = api.invoicing.search.useQuery({ query: debouncedQuery })

    return (
        <PageContent
            title="Invoices"
            description="Manage your invoices"
            titleControls={
                <Button onClick={() => router.push("./invoices/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            }
        >
            <MaxWidthWrapper>
                <div className="mb-6">
                    <Input
                        placeholder="Search invoices..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <InvoicesTable invoices={invoices} isLoading={isLoading} />
            </MaxWidthWrapper>
        </PageContent>
    )
}
