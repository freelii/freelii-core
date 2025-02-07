"use client"

import { PageContent } from "@/ui/layout/page-content"
import { useWallet } from "@/wallet/useWallet"
import { Button, MaxWidthWrapper, Separator, Tabs, TabsContent, TabsList, TabsTrigger, useCopyToClipboard } from "@freelii/ui"
import { shortAddress } from "@freelii/utils/functions"
import { ChevronDown, Copy } from "lucide-react"
import { useState } from "react"

function AccountDetails() {
  const [, copyToClipboard] = useCopyToClipboard()
  const { account } = useWallet();
  const [showAddressDetails, setShowAddressDetails] = useState(false)
  const [activeSection, setActiveSection] = useState<'wire' | 'ach' | 'blockchain' | null>(null)
  const accountDetails = {
    wire: {
      accountHolderName: "Freelii Inc.",
      routingNumber: "992187472",
      swiftCode: "CHASUS33XXX",
      accountNumber: "022109183",
      bankName: "Lead Bank",
      bankAddress: "1801 Main St",
      bankCity: "Kansas City",
      bankState: "MO",
      bankZip: "64108",
      intermediaryBank: {
        name: "JPMorgan Chase",
        swiftCode: "CHASUS33",
        address: "270 Park Avenue, New York, NY 10017",
      },
      purposeOfPayment: "Business Transaction",
    },
    ach: {
      accountHolderName: "Freelii Inc.",
      bankName: "Lead Bank",
      routingNumber: "992187472",
      accountNumber: "****2210",
    }
  }


  return (
    <div className="w-full relative space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
        {/* Left side - Recipient Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-gray-200">
            <div className="space-y-6">
              {/* Recipient Card */}
              <div className="">
                <h3 className="text-lg font-semibold mb-6">Receive Money to Your Account</h3>

                {/* Wire Transfer Section */}
                <div className="rounded-md bg-gray-50 p-3">
                  <button
                    onClick={() => setActiveSection(activeSection === 'wire' ? null : 'wire')}
                    className="flex w-full justify-between items-center text-sm font-medium"
                  >
                    <span>Wire Transfers (Domestic & International)</span>
                    <ChevronDown className={`size-4 transition-transform ${activeSection === 'wire' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSection === 'wire' && (
                    <div className="mt-3 space-y-3">
                      {/* Account Numbers Group */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{accountDetails.wire.bankName}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{accountDetails.wire.accountNumber}</span>
                            <Button onClick={() => copyToClipboard(accountDetails.wire.accountNumber.replace('*', ''))} variant="ghost" className="text-xs text-gray-500">
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Routing Number (ABA)</span>
                          <span className="font-medium flex items-center gap-2">
                            {accountDetails.wire.routingNumber}
                            <Button onClick={() => copyToClipboard(accountDetails.wire.routingNumber)} variant="ghost" className="text-xs text-gray-500">
                              <Copy className="size-3" />
                            </Button>
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">SWIFT/BIC Code</span>
                          <span className="font-medium flex items-center gap-2">
                            {accountDetails.wire.swiftCode}
                            <Button onClick={() => copyToClipboard(accountDetails.wire.swiftCode)} variant="ghost" className="text-xs text-gray-500">
                              <Copy className="size-3" />
                            </Button>
                          </span>
                        </div>
                      </div>

                      {/* Collapsible Address Details */}
                      <div className="rounded-md bg-gray-50 p-3">
                        <button
                          onClick={() => setShowAddressDetails(!showAddressDetails)}
                          className="flex w-full justify-between items-center text-sm font-medium"
                        >
                          <span>Bank Address Details</span>
                          <ChevronDown className={`size-4 transition-transform ${showAddressDetails ? 'rotate-180' : ''}`} />
                        </button>

                        {showAddressDetails && (
                          <div className="mt-2 space-y-2 pt-2 border-t border-gray-200">
                            <div className="flex flex-col justify-between text-sm">
                              <span className="font-medium flex items-center gap-2 text-right">
                                {`${accountDetails.wire.bankState} ${accountDetails.wire.bankZip}`}
                              </span>
                              <span className="font-medium flex items-center gap-2 text-right">
                                {`${accountDetails.wire.bankAddress}, ${accountDetails.wire.bankCity}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* ACH Section */}
                <div className="rounded-md bg-gray-50 p-3">
                  <button
                    onClick={() => setActiveSection(activeSection === 'ach' ? null : 'ach')}
                    className="flex w-full justify-between items-center text-sm font-medium"
                  >
                    <span>ACH Deposits</span>
                    <ChevronDown className={`size-4 transition-transform ${activeSection === 'ach' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSection === 'ach' && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Account Holder</span>
                        <span className="font-medium flex items-center gap-2">
                          {accountDetails.ach.accountHolderName}
                          <Button onClick={() => copyToClipboard(accountDetails.ach.accountHolderName)} variant="ghost" className="text-xs text-gray-500">
                            <Copy className="size-3" />
                          </Button>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bank Name</span>
                        <span className="font-medium flex items-center gap-2">
                          {accountDetails.ach.bankName}
                          <Button onClick={() => copyToClipboard(accountDetails.ach.bankName)} variant="ghost" className="text-xs text-gray-500">
                            <Copy className="size-3" />
                          </Button>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Routing Number</span>
                        <span className="font-medium flex items-center gap-2">
                          {accountDetails.ach.routingNumber}
                          <Button onClick={() => copyToClipboard(accountDetails.ach.routingNumber)} variant="ghost" className="text-xs text-gray-500">
                            <Copy className="size-3" />
                          </Button>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Account Number</span>
                        <span className="font-medium flex items-center gap-2">
                          {accountDetails.ach.accountNumber}
                          <Button onClick={() => copyToClipboard(accountDetails.ach.accountNumber.replace('*', ''))} variant="ghost" className="text-xs text-gray-500">
                            <Copy className="size-3" />
                          </Button>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Blockchain Section */}
                <div className="rounded-md bg-gray-50 p-3">
                  <button
                    onClick={() => setActiveSection(activeSection === 'blockchain' ? null : 'blockchain')}
                    className="flex w-full justify-between items-center text-sm font-medium"
                  >
                    <span>Blockchain Deposits</span>
                    <ChevronDown className={`size-4 transition-transform ${activeSection === 'blockchain' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSection === 'blockchain' && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Network</span>
                        <span>{account?.network}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Address</span>
                        <span className="font-medium flex items-center gap-2">
                          {shortAddress(account?.address, 6)}
                          <Button onClick={() => copyToClipboard(account?.address ?? '', false)} variant="ghost" className="text-xs text-gray-500">
                            <Copy className="size-3" />
                          </Button>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>


        </div>
        <div className="">
          <div className="p-4 border border-gray-200 rounded-lg">
            <Tabs defaultValue="latest" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="latest">Latest Deposits</TabsTrigger>
                <TabsTrigger value="request">Upcoming Deposits</TabsTrigger>
              </TabsList>

              <TabsContent value="latest">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <svg
                      className="size-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No deposits yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    When you receive money, your deposits will show up here.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="request">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <svg
                      className="size-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No pending deposits</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upcoming deposits will appear here once they&apos;re initiated.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DepositsPage() {
  return (
    <PageContent title="Account Deposits">
      <MaxWidthWrapper>
        <AccountDetails />
      </MaxWidthWrapper>
    </PageContent>
  )
}
