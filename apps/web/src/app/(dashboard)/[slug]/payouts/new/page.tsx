"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button, MaxWidthWrapper } from "@freelii/ui"
import { PaymentSteps } from "./payment-steps"
import { PageContent } from "@/ui/layout/page-content"
import SetupRecipients from "./steps/setup-recipients"

interface StepProps {
  onNext: () => void
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

function SchedulingForm({ onBack, onNext }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Payment Schedule</h2>
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
  banking: 2,
  additional: 3,
  schedule: 4,
  confirm: 5,
}

export default function NewPaymentPage() {
  const [step, setStep] = React.useState(1)
  const router = useRouter()
  
  const steps = [
    { id: stepIds.recipient, name: 'Recipient' },
    { id: stepIds.banking, name: 'Banking Details' },
    { id: stepIds.additional, name: 'Additional Info' },
    { id: stepIds.schedule, name: 'Schedule' },
    { id: stepIds.confirm, name: 'Confirm' },
  ]

  return (
    <PageContent titleBackButtonLink="/payouts" title="New Payment" description="Setup a new bank transfer">
      <MaxWidthWrapper>
      <PaymentSteps currentStep={step} steps={steps} setStep={setStep} />


      <div className="">
        {/* Step content will be rendered here */}
        {step === stepIds.recipient && <SetupRecipients />}
        {step === stepIds.banking && (
          <BankingForm 
            onBack={() => setStep(stepIds.recipient)} 
            onNext={() => setStep(stepIds.additional)} 
          />
        )}
        {step === stepIds.additional && (
          <AdditionalInfoForm 
            onBack={() => setStep(stepIds.banking)} 
            onNext={() => setStep(stepIds.schedule)} 
          />
        )}
        {step === stepIds.schedule && (
          <SchedulingForm 
            onBack={() => setStep(stepIds.additional)} 
            onNext={() => setStep(stepIds.confirm)} 
          />
        )}
        {step === stepIds.confirm && (
          <ConfirmationForm 
            onNext={() => router.push('/payouts')} 
            onBack={() => setStep(stepIds.schedule)}
            onConfirm={() => router.push('/payouts')} 
          />
        )}
      </div>
      </MaxWidthWrapper>

    </PageContent>
  )
} 