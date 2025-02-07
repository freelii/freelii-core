import { BlurImage, Separator } from "@freelii/ui"
import { DICEBEAR_SOLID_AVATAR_URL } from "@freelii/utils/constants"
import dayjs from "dayjs"
import { Building2, Calendar } from "lucide-react"
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
                {/* <Link
                  href={`/dashboard/invoices/create?tx_id=${payment.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className=" items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                    Generate Invoice
                  </span>
                </Link> */}
              </div>
              <div className="text-sm font-semibold">
                {payment.amount}
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>

      </div>
    </div >
  )
} 