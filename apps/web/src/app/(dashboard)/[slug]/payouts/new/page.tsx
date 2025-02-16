"use client"

import { useWalletStore } from "@/hooks/stores/wallet-store"
import { PageContent } from "@/ui/layout/page-content"
import { NavSteps } from "@/ui/shared/nav-steps"
import { MaxWidthWrapper } from "@freelii/ui"
import * as React from "react"
import SetupRecipients from "./steps/setup-recipients"


const stepIds = {
  recipient: 1,
  confirm: 2,
}

export default function NewPaymentPage() {
  const [step, setStep] = React.useState(1)
  const { getSelectedWallet } = useWalletStore()

  const steps = [
    { id: stepIds.recipient, name: 'Setup new payment' },
    { id: stepIds.confirm, name: 'Review payment details' },
  ]

  return (
    <PageContent>
      <MaxWidthWrapper>
        <NavSteps currentStep={step} steps={steps} setStep={setStep} />
        <div className="">
          {/* Step content will be rendered here */}
          {step === stepIds.recipient &&
            <SetupRecipients onNext={() => setStep(stepIds.confirm)} onBack={() => setStep(stepIds.recipient)} />
          }
        </div>
      </MaxWidthWrapper>

    </PageContent>
  )
} 