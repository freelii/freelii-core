import { Button } from "@freelii/ui"
import { Building2, ClipboardCopy, Clock, CheckCircle2 } from "lucide-react"
import { Payment } from "./page-payouts"
import { Badge } from "@freelii/ui"

interface PaymentDetailsProps {
  payment: Payment
}

export function PaymentDetails({ payment }: PaymentDetailsProps) {
  return (
    <div className="transition-opacity duration-200 delay-150 opacity-100">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{payment.recipient.name}</h3>
          {payment.recipient.isVerified ? (
            <Badge className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs">Verified</span>
            </Badge>
          ) : (
            <Badge className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Pending</span>
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500">{payment.recipient.email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Payment link</label>
          <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 p-2">
            <code className="text-sm">../pay/{payment.id}</code>
            <Button variant="ghost" className="ml-auto">
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Request notes</label>
          <p className="mt-1 text-sm">{payment.notes || 'No notes provided'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Destination account</label>
          <div className="mt-1 rounded-md border border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-2">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Ops / Payroll</p>
                <p className="text-sm text-gray-500">Checking •••1038</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="text-red-600 hover:bg-red-50">
            Cancel Request
          </Button>
          <Button className="ml-auto">
            Mark as Paid
          </Button>
        </div>
      </div>
    </div>
  )
} 