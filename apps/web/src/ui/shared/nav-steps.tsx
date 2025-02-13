import { cn } from "@freelii/utils";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export function NavSteps({
    steps,
    currentStep,
    setStep,
    backButtonLink,
    backButtonText
}: {
    steps: { id: number; name: string }[]
    currentStep: number
    setStep: (step: number) => void
    backButtonLink?: string
    backButtonText?: string
}) {
    return (
        <nav aria-label="Progress" className="pb-2 ">
            <ol role="list" className="flex items-center ">
                {backButtonLink && (
                    <li className="flex items-center mr-4">
                        <Link
                            href={backButtonLink}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span className="text-sm">{backButtonText}</span>
                        </Link>
                    </li>
                )}
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