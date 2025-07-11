"use client"

import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { Button, Input, MaxWidthWrapper } from "@freelii/ui"
import { Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { InvoicesTable } from "./invoices-table"

function useDebounce<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export default function InvoicesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialSearch = searchParams?.get('search') ?? ""
    const [query, setQuery] = useState(initialSearch)
    const debouncedQuery = useDebounce(query)
    const { data: invoices, isLoading } = api.invoicing.search.useQuery({ query: debouncedQuery })

    return (
        <PageContent
            title="Invoices"
            description="Manage your invoices"
            titleControls={
                <Button onClick={() => router.push("./invoices/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create invoice
                </Button>
            }
        >
            <MaxWidthWrapper className="space-y-6 p-6">
                <div className="mb-6">
                    <Input
                        placeholder="Search invoices..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full md:w-1/2 lg:w-1/3"
                    />
                </div>
                <InvoicesTable invoices={invoices} isLoading={isLoading} />
            </MaxWidthWrapper>
        </PageContent>
    )
}
