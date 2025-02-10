import { InstantBadge } from "@/ui/shared/badges/instant-badge"
import { BlurImage, Separator } from "@freelii/ui"
import { cn } from "@freelii/utils"
import { DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils/constants"
import dayjs from "dayjs"
import { Building2, Calendar, Check } from "lucide-react"
import { useEffect, useRef } from "react"
import { type Payout } from "./page-payouts"

interface PayoutDetailsProps {
  payment: Payout
  onClose: () => void
}

export function PaymentDetails({
  payment,
  onClose
}: PayoutDetailsProps) {
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Ignore clicks on the transaction rows
      if (event.target instanceof Element && event.target.closest('[data-transaction-row]')) {
        return
      }

      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={detailsRef}
      className="h-full p-4 overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="flex items-center justify-between gap-4 mb-6 w-full">
          <div className="flex items-center gap-2 justify-between">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {payment.progress}
            </span>
          </div>
          <span className="text-xs text-gray-500 text-left">
            {dayjs(payment.nextPayment).format("MMM D, YYYY hh:mm")}
          </span>
        </div>
        <div className="mb-6">
          <div className="">
            <div className="flex items-start gap-3">
              <BlurImage
                src={`${DICEBEAR_SOLID_AVATAR_URL}${payment.recipients[0]?.name}`}
                width={48}
                height={48}
                alt={payment.recipients[0]?.name ?? ""}
                className="size-12 shrink-0 overflow-hidden rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium">{payment.recipients[0]?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="size-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{payment.recipients[0]?.email}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

          </div>

          <div className="gap-4 mb-6">
            <div className="w-full">
              <div className="text-sm text-gray-500 flex items-center justify-between w-full">
                Payment amount
              </div>
              <div className="text-sm font-semibold">
                {payment.amount}
              </div>
            </div>
          </div>

          {/* Add Timeline Section */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Payment Progress</p>

            <div className="mt-4">
              {/* Timeline steps */}
              <div className="relative pl-8 border-l-2 border-[#4ab3e8] pb-6">
                <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full bg-[#4ab3e8]" />
                <div>
                  <p className="font-medium text-sm">Payment Initiated</p>
                  <p className="text-xs text-gray-500">
                    {dayjs(payment.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>

              {!payment.isInstant && <div className="relative pl-8 border-l-2 border-gray-200 pb-6">
                <div className={cn(
                  "border-gray-200 bg-white absolute left-0 -translate-x-[9px] size-4 rounded-full border-2 transition-all duration-300",
                  payment.status === "processing" && "border-[#4ab3e8] bg-[#4ab3e8]"
                )} />
                <div>
                  <p className="font-medium text-sm">Processing</p>
                  <p className="text-xs text-gray-500">Within 24 hours</p>
                </div>
              </div>}

              <div className="relative pl-8 border-l-2 border-transparent">
                <div className={cn(
                  "absolute left-0 -translate-x-[9px] size-4 rounded-full border-2 border-gray-200 bg-white",
                  payment.status === "COMPLETED" && "border-[#4ab3e8] bg-[#4ab3e8]"
                )} />
                <div>
                  <p className="font-medium text-sm flex items-center gap-1">
                    Completed
                    {payment.status === "COMPLETED" && <Check className="size-4 text-green-500" />}
                    {payment.isInstant && <InstantBadge />}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {payment.isInstant ?
                      dayjs(payment.createdAt).format("MMM D, YYYY hh:mm")
                      : "1-2 business days"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div >
  )
} 