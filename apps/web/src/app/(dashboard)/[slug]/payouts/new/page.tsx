"use client"

import { PageContent } from "@/ui/layout/page-content"
import { Button, MaxWidthWrapper } from "@freelii/ui"
import { useRouter } from "next/navigation"
import * as React from "react"
import { PaymentSteps } from "./payment-steps"
import PayoutPreview from "./steps/payout-review"
import SetupRecipients from "./steps/setup-recipients"

interface StepProps {
  onNext?: () => void
  onBack?: () => void
  onConfirm?: () => void
}


function BankingForm({ onBack, onNext }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Banking Details</h2>
      <div className="space-y-4">
        {/* Add form fields here */}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}

function AdditionalInfoForm({ onBack, onNext }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Additional Information</h2>
      <div className="space-y-4">
        {/* Add form fields here */}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}

function SchedulingForm({ onBack, onConfirm }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Payment Schedule</h2>
      <div className="space-y-4">
        {/* Add form fields here */}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  )
}

function ConfirmationForm({ onBack, onConfirm }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Confirm Payment</h2>
      <div className="space-y-4">
        {/* Add summary information here */}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onConfirm}>Confirm Payment</Button>
      </div>
    </div>
  )
}

const stepIds = {
  recipient: 1,
  confirm: 2,
}

export default function NewPaymentPage() {
  const [step, setStep] = React.useState(1)
  const router = useRouter()

  const steps = [
    { id: stepIds.recipient, name: 'Setup new payment' },
    { id: stepIds.confirm, name: 'Review payment details' },
  ]

  return (
    <PageContent titleBackButtonLink="/dashboard/payouts" title="New Payment">
      <MaxWidthWrapper>
        <PaymentSteps currentStep={step} steps={steps} setStep={setStep} />
        <div className="">
          {/* Step content will be rendered here */}
          {step === stepIds.recipient && <SetupRecipients onNext={() => setStep(stepIds.confirm)} onBack={() => setStep(stepIds.recipient)} />}
          {step === stepIds.confirm && (
            <PayoutPreview />
          )}
        </div>
      </MaxWidthWrapper>

    </PageContent>
  )
} 