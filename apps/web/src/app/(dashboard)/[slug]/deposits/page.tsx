"use client"

import { PageContent } from "@/ui/layout/page-content"
import { FileText } from "lucide-react"

function EmptyDepositsPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
        <div className="p-4 rounded-full bg-gray-50 mb-4">
          <FileText className="size-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No deposits yet
        </h3>

        <p className="text-gray-500 text-center mb-6 max-w-[400px]">
          When you make your first deposit, all the details will appear here.
        </p>
      </div>
    </div>
  )
}

export default function DepositsPage() {
  // You can replace this with actual transaction data check
  const hasTransactions = false

  return (
    <PageContent title="Account Deposits">
      {hasTransactions ? (
        <div>Deposits list will go here</div>
      ) : (
        <EmptyDepositsPage />
      )}
    </PageContent>
  )
}
