import { Badge } from "@freelii/ui"
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react"
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

  const totalAmount = payment.amount * payment.recipients.length
  const verifiedCount = payment.recipients.filter(r => r.isVerified).length

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
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{payment.label}</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">Total amount</div>
              <div className="text-lg font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: payment.currency === "USDC" ? "USD" : payment.currency,
                }).format(totalAmount)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Per recipient</div>
              <div className="text-lg font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: payment.currency === "USDC" ? "USD" : payment.currency,
                }).format(payment.amount)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {payment.recipients.length} recipients
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {payment.progress}
              </span>
            </div>
          </div>
        </div>

        {/* Recipients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-500">Recipients</h4>
            <div className="text-xs text-gray-500">
              {verifiedCount} of {payment.recipients.length} verified
            </div>
          </div>

          <div className="space-y-3">
            {payment.recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{recipient.name}</div>
                    {recipient.isVerified ? (
                      <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-xs">Verified</span>
                      </Badge>
                    ) : (
                      <Badge className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Pending</span>
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment.currency === "USDC" ? "USD" : payment.currency,
                    }).format(payment.amount)}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{recipient.email}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
} 