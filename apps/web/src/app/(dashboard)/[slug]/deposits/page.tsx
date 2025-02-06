"use client"

import { PageContent } from "@/ui/layout/page-content"
import { InstantBadge } from "@/ui/shared/badges/instant-badge"
import { BlurImage, Button, MaxWidthWrapper, Separator, useCopyToClipboard } from "@freelii/ui"
import { DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils/constants"
import { Copy } from "lucide-react"

function AccountDetails() {
  const [, copyToClipboard] = useCopyToClipboard()
  const accountDetails = {
    wire: {
      routingNumber: "992187472",
      accountNumber: "****2210",
      bankName: "Lead Bank",
      bankAddress: "1801 Main St",
      bankCity: "Kansas City",
      bankState: "MO",
      bankZip: "64108",
    },
    crypto: {
      address: "CDIG...CRHP",
      network: "Stellar",
    }
  }


  return (
    <>
      <div className="w-full relative space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
          {/* Left side - Recipient Details */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-gray-200">
              <div className="space-y-6">
                {/* Recipient Card */}
                <div className="">
                  <div className="flex items-start gap-3">
                    <BlurImage
                      src={`${DICEBEAR_SOLID_AVATAR_URL}AAA`}
                      width={48}
                      height={48}
                      alt="AAA"
                      className="size-12 shrink-0 overflow-hidden rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium">AAA</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">AAA</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{accountDetails.wire.bankName}</span>
                      <span className="font-medium flex items-center gap-2">
                        {accountDetails.wire.bankAddress}
                        <Button onClick={() => copyToClipboard(accountDetails.wire.bankAddress)} variant="ghost" className="text-xs text-gray-500">
                          <Copy className="size-3" />
                        </Button>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Routing number</span>
                      <span className="font-medium flex items-center gap-2">
                        {accountDetails.wire.routingNumber}
                        <Button onClick={() => copyToClipboard(accountDetails.wire.routingNumber)} variant="ghost" className="text-xs text-gray-500">
                          <Copy className="size-3" />
                        </Button>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account number</span>
                      <div className="flex items-center gap-2">
                        <span>{accountDetails.wire.accountNumber}</span>
                        <Button onClick={() => copyToClipboard(accountDetails.wire.accountNumber.replace('*', ''))} variant="ghost" className="text-xs text-gray-500">
                          <Copy className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated delivery</span>
                      <InstantBadge />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium">Recipient Account</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Network</span>
                        <span>Stellar</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Address</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          CDIG...CRHP
                          <Button onClick={() => copyToClipboard('CDIG...CRHP')} variant="ghost" className="text-xs text-gray-500">
                            <Copy className="size-3" />
                          </Button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div >
    </>
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
