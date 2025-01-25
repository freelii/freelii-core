"use client"

import { useFixtures } from "@/fixtures/useFixtures"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { Badge, BlurImage, Button, Separator } from "@freelii/ui"
import { CURRENCIES, DICEBEAR_SOLID_AVATAR_URL, noop } from "@freelii/utils"
import { ArrowDownRight, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Payout } from "./payouts/page-payouts"

export default function PageClient() {
  const { subAccounts, getPayouts } = useFixtures()
  const [recentPayouts, setRecentPayouts] = useState<Payout[]>([])

  useEffect(() => {
    const fetchPayouts = async () => {
      const payouts = await getPayouts()
      setRecentPayouts(payouts.slice(0, 3)) // Only show last 3 payouts
    }
    fetchPayouts().finally(noop)
  }, [getPayouts])

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sub-accounts</h2>
          <p className="text-sm text-gray-500">Manage your currency accounts</p>
        </div>
        <div className="flex gap-3">
          <Button disabled variant="outline" className="text-xs gap-2 cursor-not-allowed">
            <Plus className="size-4" />
            New Sub-account
          </Button>
          <Button className="gap-2 text-xs">
            New Payment
          </Button>
        </div>
      </div>

      {/* Sub-account Cards */}
      <div className="grid grid-cols-3 gap-4">
        {subAccounts.map((account) => (
          <div
            key={account.id}
            className="p-4 hover:border-gray-300 transition-colors border border-gray-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FlagIcon currencyCode={account.currency} size={14} />
                  <span className="font-medium text-sm">{account.name}</span>
                </div>
                <div className="text-xl font-semibold">
                  {CURRENCIES[account.currency]?.symbol}
                  {account.balance.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Available balance</div>
              </div>
              <Badge
                className={`${account.status === 'active'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-50 text-gray-700'
                  }`}
              >
                {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {account.accountNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payouts */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Payouts</h2>
          <Link href="dashboard/payouts">
            <Button variant="outline">
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentPayouts.map((payout) => (
            <div key={payout.id}>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gray-50">
                    <ArrowDownRight className="size-3.5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{payout.label}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex -space-x-1.5">
                        {payout.recipients.slice(0, 3).map((recipient, index) => (
                          <BlurImage
                            key={recipient.id}
                            src={`${DICEBEAR_SOLID_AVATAR_URL}${recipient.name}`}
                            width={12}
                            height={12}
                            alt={recipient.name}
                            className="size-4 shrink-0 overflow-hidden rounded-full border-1.5 border-white"
                            style={{ zIndex: payout.recipients.length - index }}
                          />
                        ))}
                      </div>
                      <span>
                        {payout.recipients.length} recipients
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium flex items-center gap-1 justify-end">
                      <FlagIcon currencyCode={payout.currency} size={12} />
                      {CURRENCIES[payout.currency]?.symbol}
                      {payout.amount.toLocaleString()}
                    </div>
                    <Badge className="bg-gray-50 text-gray-700 text-[10px]">
                      {payout.progress}
                    </Badge>
                  </div>
                  <Link href={`dashboard/payouts/${payout.id}`}>
                    <Button variant="ghost">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
              <Separator className="mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
