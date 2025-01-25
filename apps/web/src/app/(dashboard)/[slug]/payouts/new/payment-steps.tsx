import { cn } from "@freelii/utils";
import { ChevronRightIcon } from "lucide-react";

export function PaymentSteps({
  steps,
  currentStep,
  setStep
}: {
  steps: { id: number; name: string }[]
  currentStep: number
  setStep: (step: number) => void
}) {
  return (
    <nav aria-label="Progress" className="pb-2 ">
      <ol role="list" className="flex items-center ">
        {steps.map((step, index) => (
          <li key={step.name} className="flex items-center ">
            <div
              className={cn(
                "bg-transparent rounded-full px-2 py-1 text-xs",
                step.id < currentStep
                  ? " text-primary"
                  : step.id === currentStep
                    ? " text-primary font-medium"
                    : " text-gray-500"
              )}
              onClick={() => setStep(step.id)}
            >
              {step.name}
            </div>
            {index < steps.length - 1 && (
              <ChevronRightIcon
                className="h-5 w-5 mx-0 text-gray-400"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 