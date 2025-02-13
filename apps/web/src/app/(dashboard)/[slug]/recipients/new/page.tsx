"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { FiatDetails } from "@/ui/render-fiat-details"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { NavSteps } from "@/ui/shared/nav-steps"
import { Button, ExpandingArrow, Input, LoadingDots, MaxWidthWrapper, Tooltip, useRouterStuff } from "@freelii/ui"
import { cn } from "@freelii/utils"
import { ArrowLeft, Building2, Check, FileText, HelpCircle, InfoIcon, Mail, Plus, User2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export interface FormData {
    type: "company" | "person"
    name: string
    email?: string
    taxNumber: string
    street: string
    city: string
    state: string
    country: "Philippines" | "Mexico" | "United States"
    zipCode: string
    paymentMethod: "fiat" | "ewallet" | "blockchain"
    transferMethod?: "instapay" | "pesonet"
    ewalletProvider?: "gcash" | "maya" | "coins_ph"
    mobileNumber?: string
    swiftCode?: string
    bankAddress?: string
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: "checking" | "savings"
    accountHolderName: string
    walletAddress: string
    network: "stellar"
    currency: "USD" | "PHP" | "MXN"
}

export default function NewRecipientPage() {
    const { router, searchParams } = useRouterStuff();
    const [currentStep, setCurrentStep] = useState(0)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [showAccountHolderNameForm, setShowAccountHolderNameForm] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        type: "person",
        name: "",
        email: undefined,
        taxNumber: "",
        street: "",
        city: "",
        state: "",
        country: "Philippines",
        zipCode: "",
        paymentMethod: "fiat",
        transferMethod: undefined,
        ewalletProvider: undefined,
        mobileNumber: undefined,
        swiftCode: undefined,
        bankAddress: undefined,
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        accountType: "checking",
        accountHolderName: "",
        walletAddress: "",
        network: "stellar",
        currency: "USD",
    })

    // tRPC procedures
    const createRecipient = api.clients.create.useMutation({
        onError: ClientTRPCErrorHandler,
    })


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Assign currency based on country
        const currency = formData.country === "Philippines" ? "PHP" : formData.country === "Mexico" ? "MXN" : "USD"
        setFormData({ ...formData, currency })

        const newRecipient = await createRecipient.mutateAsync(formData);
        // If comes from payments, redirect to payments
        if (searchParams.get("from") === "payments") {
            void router.push(`/dashboard/payouts/new?recipientId=${newRecipient.id}`)
        } else {
            void router.push(`/dashboard/recipients`)
        }
    }

    const steps = [
        { id: 0, name: "Recipient Type", component: TypeStep },
        { id: 1, name: "Payment Method", component: PaymentMethodStep },
        { id: 2, name: "Basic Information", component: BasicInfoStep },
        { id: 3, name: "Payment Details", component: BankingStep },
        { id: 4, name: "Review", component: ReviewStep },
    ]

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    return (
        <PageContent className="m-1">
            <MaxWidthWrapper>
                <div className="space-y-6 ">
                    <NavSteps currentStep={currentStep} steps={steps} setStep={setCurrentStep} />
                    <div className="grid grid-cols-12 gap-6 ">
                        <div className="col-span-8">
                            <div className="bg-white py-2 px-6">
                                {steps[currentStep]?.component({
                                    formData,
                                    setFormData,
                                    showAddressForm,
                                    setShowAddressForm,
                                    showEmailForm,
                                    setShowEmailForm,
                                    showAccountHolderNameForm,
                                    setShowAccountHolderNameForm
                                })}
                                {/* Navigation buttons */}
                                <div className="flex justify-between mt-6">
                                    <Button
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                        className="flex items-center text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    {currentStep !== steps.length - 1 ? (
                                        <Button
                                            variant="outline"
                                            onClick={nextStep}
                                            className="group flex items-center px-4 py-2 pr-7"
                                        >
                                            Next
                                            <ExpandingArrow className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={handleSubmit}
                                            className={cn(createRecipient.isPending && "opacity-50 cursor-not-allowed py-3")}
                                        >
                                            {createRecipient.isPending ?
                                                <LoadingDots className="h-4 w-4" color="white" />
                                                : "Save Recipient"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-4">
                            <div className="bg-white p-6 rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[15px] font-medium text-gray-900">Progress</h2>
                                    {formData.currency && (
                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200">
                                            <FlagIcon currencyCode={formData.currency} size={16} />
                                            <span className="text-[13px] font-medium text-gray-700">{formData.currency}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6">
                                    {/* Recipient Type Step */}
                                    <div className="relative pl-8 border-l-2 border-blue-600 pb-6">
                                        <div className="absolute left-0 -translate-x-[10px] size-[18px] rounded-full bg-blue-600 ring-4 ring-blue-50" />
                                        <div>
                                            <p className="font-medium text-[13px] text-gray-900">Recipient Type</p>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {formData.type === "company" ? "Business Account" :
                                                    formData.type === "person" ? "Individual Account" :
                                                        "Select type"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Method Step */}
                                    <div className={`relative pl-8 border-l-2 pb-6 
                                        ${currentStep >= 1 ? 'border-blue-600' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[10px] size-[18px] rounded-full 
                                            ${currentStep >= 1 ? 'bg-blue-600 ring-4 ring-blue-50' : 'border-2 border-gray-300 bg-white'}`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium text-[13px] ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    Payment Method
                                                </p>
                                                {currentStep >= 1 && formData.country && (
                                                    <span className="text-[12px] text-gray-500">• {formData.country}</span>
                                                )}
                                            </div>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {currentStep >= 1 ? (
                                                    formData.paymentMethod === "fiat" ? "Bank Transfer" :
                                                        formData.paymentMethod === "ewallet" ? "E-Wallet" :
                                                            formData.paymentMethod === "blockchain" ? "Blockchain" :
                                                                "Select method"
                                                ) : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Basic Information Step */}
                                    <div className={`relative pl-8 border-l-2 pb-6 
                                        ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[10px] size-[18px] rounded-full 
                                            ${currentStep >= 2 ? 'bg-blue-600 ring-4 ring-blue-50' : 'border-2 border-gray-300 bg-white'}`} />
                                        <div>
                                            <p className={`font-medium text-[13px] ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Basic Information
                                            </p>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {currentStep >= 2 ? (
                                                    formData.name ? `${formData.name}` : "Enter details"
                                                ) : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Details Step */}
                                    <div className={`relative pl-8 border-l-2 pb-6 
                                        ${currentStep >= 3 ? 'border-blue-600' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[10px] size-[18px] rounded-full 
                                            ${currentStep >= 3 ? 'bg-blue-600 ring-4 ring-blue-50' : 'border-2 border-gray-300 bg-white'}`} />
                                        <div>
                                            <p className={`font-medium text-[13px] ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Payment Details
                                            </p>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {currentStep >= 3 ? (
                                                    formData.paymentMethod === "fiat" ? (
                                                        formData.bankName || "Enter bank details"
                                                    ) : formData.paymentMethod === "ewallet" ? (
                                                        formData.ewalletProvider || "Select provider"
                                                    ) : formData.paymentMethod === "blockchain" ? (
                                                        "Wallet details"
                                                    ) : "Pending"
                                                ) : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Review Step */}
                                    <div className={`relative pl-8 border-l-2 border-transparent`}>
                                        <div className={`absolute left-0 -translate-x-[10px] size-[18px] rounded-full 
                                            ${currentStep >= 4 ? 'bg-blue-600 ring-4 ring-blue-50' : 'border-2 border-gray-300 bg-white'}`} />
                                        <div>
                                            <p className={`font-medium text-[13px] ${currentStep >= 4 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Review
                                            </p>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {currentStep >= 4 ? "Verify information" : "Pending"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>


                </div>
            </MaxWidthWrapper>
        </PageContent>
    )
}

// Step Components
function TypeStep({ formData, setFormData }: { formData: FormData, setFormData: (data: FormData) => void }) {
    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">Select recipient type</h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Choose the type of recipient you want to add
                </p>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <InfoIcon className="size-4 text-gray-400" />
                    <p className="text-[13px] text-gray-600">
                        This helps us customize tax forms and compliance requirements for your recipient
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "person" })}
                    className={cn(
                        "group relative p-4 text-left border rounded-lg transition-all",
                        "hover:border-gray-300 hover:bg-gray-50/50",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                        formData.type === "person" ? "border-blue-600 bg-blue-50/50" : "border-gray-200"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <User2 className="size-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[15px] font-medium text-gray-900">Person</h3>
                                {formData.type === "person" && (
                                    <Check className="size-5 text-blue-600" />
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Individual recipient for personal invoicing</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                <FileText className="size-3 text-gray-400" />
                                <span className="text-[12px] text-gray-600">Uses Form 1099</span>
                            </div>
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "company" })}
                    className={cn(
                        "group relative p-4 text-left border rounded-lg transition-all",
                        "hover:border-gray-300 hover:bg-gray-50/50",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                        formData.type === "company" ? "border-blue-600 bg-blue-50/50" : "border-gray-200"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                            <Building2 className="size-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[15px] font-medium text-gray-900">Company</h3>
                                {formData.type === "company" && (
                                    <Check className="size-5 text-blue-600" />
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Business or organization for professional invoicing</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                <FileText className="size-3 text-gray-400" />
                                <span className="text-[12px] text-gray-600">Uses Form W-9</span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}

function PaymentMethodStep({ formData, setFormData }: { formData: FormData, setFormData: (data: FormData) => void }) {
    return (
        <div className="space-y-8">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">Select payment method</h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Choose how you will be sending payments to your recipient.
                </p>
            </div>

            <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Country
                </label>
                <p className="text-[13px] text-gray-500 mb-3">
                    This will determine available payment methods and tax requirements
                </p>
                <CountrySelect
                    value={formData.country}
                    onChange={(country) => {
                        const currency = country === "Philippines" ? "PHP" :
                            country === "Mexico" ? "MXN" : "USD"
                        const paymentMethod = (country !== "Philippines" && formData.paymentMethod === "ewallet") ? "fiat" : formData.paymentMethod
                        setFormData({ ...formData, country: country as "Philippines" | "Mexico" | "United States", currency, paymentMethod })
                    }}
                />
            </div>

            {formData.country && (
                <div className="mt-8">
                    <label className="block text-[13px] font-medium text-gray-700 mb-3">
                        Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMethod: "fiat" })}
                            className={`flex items-center p-4 border rounded-lg hover:border-gray-300 transition-colors
                                ${formData.paymentMethod === "fiat"
                                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                    : "border-gray-200"}`}
                        >
                            <div className="flex-1 text-left">
                                <p className="font-medium text-[15px] text-gray-900">Bank Transfer</p>
                                <p className="text-[13px] text-gray-500 mt-0.5">
                                    ACH/Wire transfer to bank account
                                </p>
                            </div>
                            <div className={`size-5 rounded-full border flex items-center justify-center
                                ${formData.paymentMethod === "fiat"
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-gray-300"}`}
                            >
                                {formData.paymentMethod === "fiat" && (
                                    <div className="size-2 rounded-full bg-white" />
                                )}
                            </div>
                        </button>

                        {formData.country === "Philippines" && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: "ewallet" })}
                                className={`flex items-center p-4 border rounded-lg hover:border-gray-300 transition-colors
                                    ${formData.paymentMethod === "ewallet"
                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                        : "border-gray-200"}`}
                            >
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-[15px] text-gray-900">E-Wallet</p>
                                    <p className="text-[13px] text-gray-500 mt-0.5">
                                        GCash, Maya, or Coins.ph
                                    </p>
                                </div>
                                <div className={`size-5 rounded-full border flex items-center justify-center
                                    ${formData.paymentMethod === "ewallet"
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-300"}`}
                                >
                                    {formData.paymentMethod === "ewallet" && (
                                        <div className="size-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMethod: "blockchain" })}
                            className={`flex items-center p-4 border rounded-lg hover:border-gray-300 transition-colors
                                ${formData.paymentMethod === "blockchain"
                                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                    : "border-gray-200"}`}
                        >
                            <div className="flex-1 text-left">
                                <p className="font-medium text-[15px] text-gray-900">Blockchain</p>
                                <p className="text-[13px] text-gray-500 mt-0.5">
                                    Send to crypto wallet
                                </p>
                            </div>
                            <div className={`size-5 rounded-full border flex items-center justify-center
                                ${formData.paymentMethod === "blockchain"
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-gray-300"}`}
                            >
                                {formData.paymentMethod === "blockchain" && (
                                    <div className="size-2 rounded-full bg-white" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function BasicInfoStep({ formData, setFormData, showEmailForm, setShowEmailForm }: {
    formData: FormData,
    setFormData: (data: FormData) => void,
    showEmailForm: boolean,
    setShowEmailForm: (show: boolean) => void
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const getTaxNumberHint = () => {
        switch (formData.country) {
            case "Philippines":
                return "TIN (Tax Identification Number) - Format: XXX-XXX-XXX-XXX"
            case "Mexico":
                return "RFC (Registro Federal de Contribuyentes) - Format: AAAA123456XXX"
            case "United States":
                return "EIN (Employer Identification Number) - Format: XX-XXXXXXX"
            default:
                return "Tax/VAT registration number"
        }
    }


    return (
        <div className="space-y-8">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">Basic information</h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Enter the recipient&apos;s details for payment processing
                </p>
            </div>

            <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                        {formData.type === "company" ? "Legal business name" : "Full name"}
                    </label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={formData.type === "company" ? "Example Inc." : "Jane Smith"}
                        className="w-full"
                    />
                </div>

                {/* Tax Number for Companies */}
                {formData.type === "company" && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <label className="block text-sm font-medium text-gray-700">Tax identification number</label>
                            <Tooltip content={getTaxNumberHint()}>
                                <HelpCircle className="size-4 text-gray-400 cursor-help" />
                            </Tooltip>
                        </div>
                        <Input
                            type="text"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleChange}
                            placeholder={getTaxNumberHint()}
                            className="w-full font-mono"
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <FileText className="size-4 text-gray-400" />
                            <span className="text-[13px] text-gray-600">
                                Required for tax compliance and invoicing
                            </span>
                        </div>
                    </div>
                )}

                {/* Email Section */}
                <div className="rounded-lg border border-gray-200">
                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-gray-900">Contact email</h3>
                            <p className="text-[13px] text-gray-500">We&apos;ll send payment notifications and invoices here</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowEmailForm(!showEmailForm)}
                            className="text-xs"
                        >
                            {showEmailForm ? (
                                <>
                                    <X className="size-3 mr-1.5" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Plus className="size-3 mr-1.5" />
                                    Add email
                                </>
                            )}
                        </Button>
                    </div>

                    {showEmailForm && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="space-y-3">
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="recipient@example.com"
                                    className="w-full"
                                />
                                <div className="flex items-center gap-2">
                                    <Mail className="size-4 text-gray-400" />
                                    <span className="text-[13px] text-gray-600">
                                        We&apos;ll send payment confirmations here
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showEmailForm && formData.email && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <Mail className="size-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{formData.email}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function CountrySelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const [highlightedIndex, setHighlightedIndex] = useState(0)

    // Common countries to show at the top
    const commonCountries = ["Philippines", "United States", "Singapore", "Japan", "Australia"]

    // All countries data
    const countries = [
        { name: "Philippines", currencyCode: "PHP", },
        { name: "Mexico", currencyCode: "MXN", },
        { name: "United States", currencyCode: "USD", },
    ]

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase())
    )

    const selectedCountry = countries.find(c => c.name === value)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlightedIndex(prev =>
                prev < filteredCountries.length - 1 ? prev + 1 : prev
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (filteredCountries[highlightedIndex]) {
                onChange(filteredCountries[highlightedIndex].name)
                setIsOpen(false)
                setSearch("")
            }
        } else if (e.key === "Escape") {
            setIsOpen(false)
            setSearch("")
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={inputRef}>
            <div className="relative">
                <Input
                    type="text"
                    value={isOpen ? search : selectedCountry?.name ?? ""}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setIsOpen(true)
                        setHighlightedIndex(0)
                    }}
                    onFocus={() => {
                        setIsOpen(true)
                        setSearch("")
                    }}
                    placeholder="Select destination country"
                    className="w-full pl-10"
                    autoComplete="false"
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FlagIcon size={16} currencyCode={selectedCountry?.currencyCode ?? ""} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCountries.map((country, index) => (
                        <button
                            key={country.currencyCode}
                            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100
                                ${index === highlightedIndex ? 'bg-gray-100' : ''}
                                ${value === country.name ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                                onChange(country.name)
                                setIsOpen(false)
                                setSearch("")
                            }}
                        >
                            <FlagIcon currencyCode={country.currencyCode} size={16} />
                            <span>{country.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function BankingStep({ formData, setFormData, showAccountHolderNameForm, setShowAccountHolderNameForm }: { formData: FormData, setFormData: (data: FormData) => void, showAccountHolderNameForm: boolean, setShowAccountHolderNameForm: (show: boolean) => void }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Get country-specific payment info
    const getCountryPaymentInfo = () => {
        switch (formData.country) {
            case "Philippines":
                return {
                    icon: <FlagIcon currencyCode="PHP" size={20} />,
                    message: "These payment options are available for recipients in the Philippines"
                }
            case "Mexico":
                return {
                    icon: <FlagIcon currencyCode="MXN" size={20} />,
                    message: "These payment options are available for recipients in Mexico"
                }
            case "United States":
                return {
                    icon: <FlagIcon currencyCode="USD" size={20} />,
                    message: "These payment options are available for recipients in the United States"
                }
            default:
                return null
        }
    }

    const countryInfo = getCountryPaymentInfo()

    return (
        <div className="space-y-4">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">
                    Payment details
                </h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Enter the recipient&apos;s payment details
                </p>
            </div>

            {/* Country-specific Payment Options Banner */}
            {countryInfo && (
                <div className="bg-[#F5F9FF] rounded-lg p-4 flex items-center gap-3">
                    <div className="shrink-0">
                        {countryInfo.icon}
                    </div>
                    <p className="text-[15px] text-[#3355BB] font-normal">
                        {countryInfo.message}
                    </p>
                </div>
            )}




            {/* Conditional Form Content */}
            {formData.paymentMethod === "fiat" && (
                <div className="space-y-4">
                    <div className="mt-4">
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Account Holder Name</span>
                                    {!showAccountHolderNameForm && (
                                        <span className="text-sm">{formData.accountHolderName || formData.name}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAccountHolderNameForm(!showAccountHolderNameForm)}
                                    className="items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    {showAccountHolderNameForm ? "Hide" : formData.accountHolderName ? "Edit" : "Use different name"}
                                </button>
                            </div>

                            {showAccountHolderNameForm && (
                                <div className="mt-3">
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            name="accountHolderName"
                                            value={formData.accountHolderName}
                                            onChange={handleChange}
                                            placeholder="Exact name on bank account"
                                            className="w-full"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (formData.accountHolderName) {
                                                    setShowAccountHolderNameForm(false)
                                                }
                                            }}
                                            className="whitespace-nowrap"
                                        >
                                            Confirm Name
                                        </Button>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <User2 className="size-4 text-gray-400" />
                                        <span className="text-[13px] text-gray-600">
                                            This name will be different from the recipient name ({formData.name})
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {formData.country === "Mexico" ? (
                        <>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                    CLABE</label>
                                <Input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="18-digit CLABE number"
                                    className="w-full"
                                    maxLength={18}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The CLABE is an 18-digit number used for bank transfers in Mexico
                                </p>
                            </div>
                        </>
                    ) : formData.country === "United States" ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Name</label>
                                <Input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    placeholder="Enter bank name"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Account Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, accountType: "checking" })}
                                        className={`p-4 border rounded-lg text-left ${formData.accountType === "checking" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                                    >
                                        <h3 className="font-medium">Checking</h3>
                                        <p className="text-sm text-gray-500">Personal or business checking</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, accountType: "savings" })}
                                        className={`p-4 border rounded-lg text-left ${formData.accountType === "savings" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                                    >
                                        <h3 className="font-medium">Savings</h3>
                                        <p className="text-sm text-gray-500">Personal savings account</p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Routing Number</label>
                                <Input
                                    type="text"
                                    name="routingNumber"
                                    value={formData.routingNumber}
                                    onChange={handleChange}
                                    placeholder="9-digit routing number"
                                    className="w-full"
                                    maxLength={9}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The routing number is a 9-digit code used to identify your bank
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Account Number</label>
                                <Input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="Enter account number"
                                    className="w-full"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium mb-1">Purpose of Payment</label>
                                <Input
                                    type="text"
                                    name="purposeOfPayment"
                                    value={formData.purposeOfPayment}
                                    onChange={handleChange}
                                    placeholder="e.g., Services rendered, Consulting fees"
                                    className="w-full"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Required for international wire transfers
                                </p>
                            </div> */}
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Name</label>
                                <select
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md text-gray-500 text-sm border-zinc-200"
                                >
                                    <option value="">Select Bank</option>
                                    {formData.country === "Philippines" ? (
                                        <>
                                            <option value="BDO">BDO</option>
                                            <option value="BPI">BPI</option>
                                            <option value="UnionBank">UnionBank</option>
                                            <option value="Metrobank">Metrobank</option>
                                            <option value="Landbank">Landbank</option>
                                        </>
                                    ) : null}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Account Number</label>
                                <Input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="10-16 digit account number"
                                    className="w-full"
                                />
                            </div>

                            {formData.country === "Philippines" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Transfer Method</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, transferMethod: "instapay" })}
                                            className={`p-4 border rounded-lg text-left ${formData.transferMethod === "instapay" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                                        >
                                            <h3 className="font-medium">InstaPay</h3>
                                            <p className="text-sm text-gray-500">Real-time transfer</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, transferMethod: "pesonet" })}
                                            className={`p-4 border rounded-lg text-left ${formData.transferMethod === "pesonet" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                                        >
                                            <h3 className="font-medium">PESONet</h3>
                                            <p className="text-sm text-gray-500">Same-day batch processing</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {formData.paymentMethod === "ewallet" && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-Wallet Provider</label>
                        <div className="grid grid-cols-3 gap-3">
                            {["gcash", "maya", "coins_ph"].map((provider) => (
                                <div key={provider}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, ewalletProvider: provider as "gcash" | "maya" | "coins_ph" })}
                                        className={`w-full flex items-center p-4 border rounded-lg hover:border-gray-300 transition-colors
                                        ${formData.ewalletProvider === provider
                                                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                : "border-gray-200"}`}
                                    >
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-[15px] text-gray-900">
                                                {provider.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join('.')}
                                            </p>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {provider === "gcash" ? "GCash Mobile Wallet" :
                                                    provider === "maya" ? "Maya Digital Bank" :
                                                        "Coins.ph Wallet"}
                                            </p>
                                        </div>
                                        <div className={`size-5 rounded-full border flex items-center justify-center
                                        ${formData.ewalletProvider === provider
                                                ? "border-blue-600 bg-blue-600"
                                                : "border-gray-300"}`}
                                        >
                                            {formData.ewalletProvider === provider && (
                                                <div className="size-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </button>

                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Additional fields for Coins.ph */}
                    {formData.ewalletProvider === "coins_ph" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                    Account Number
                                </label>
                                <Input
                                    type="text"
                                    name="coinsPhAccount"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder="Enter your Coins.ph account number"
                                    className="w-full h-[36px] shadow-sm font-mono text-[15px]"
                                />
                                <p className="mt-2 text-[13px] text-gray-500">
                                    Your 12-digit Coins.ph account number
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <Input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="+63 XXX XXX XXXX"
                            className="w-full h-[36px] shadow-sm text-[15px] font-mono"
                        />
                        <p className="mt-2 text-[13px] text-gray-500">
                            This number must match your e-wallet account
                        </p>
                    </div>

                </div>
            )}


            {formData.paymentMethod === "blockchain" && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Network</label>
                        <select
                            name="network"
                            value={formData.network}
                            onChange={handleChange}
                            className="w-full px-2 border rounded-md text-gray-500 text-sm border-zinc-200"
                        >
                            <option value="stellar" className="text-gray-500">Stellar (XLM)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Wallet Address</label>
                        <Input
                            type="text"
                            name="walletAddress"
                            value={formData.walletAddress}
                            onChange={handleChange}
                            placeholder="Enter your wallet address"
                            className="w-full font-mono"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function ReviewStep({ formData, setFormData, showEmailForm, setShowEmailForm, showAddressForm, setShowAddressForm }: {
    formData: FormData,
    setFormData: (data: FormData) => void,
    showEmailForm: boolean,
    setShowEmailForm: (show: boolean) => void,
    showAddressForm: boolean,
    setShowAddressForm: (show: boolean) => void
}) {
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Helper function to render fiat payment details based on country


    return (
        <div className="space-y-6">
            <h2 className="text-[28px] text-gray-900 font-medium leading-9">Basic information</h2>
            <p className="mt-1 text-[15px] text-gray-600">
                Make sure the information is correct before submitting
            </p>
            <div className="space-y-4">
                {/* Basic Info Card */}
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-medium">{formData.name}</h3>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                            {formData.type === "company" ? "Business" : "Individual"}
                        </span>
                    </div>

                    {formData.type === "company" && formData.taxNumber && (
                        <div className="mb-4">
                            <span className="text-sm text-gray-500">Tax Number: </span>
                            <span className="text-sm font-medium">{formData.taxNumber}</span>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Email</span>
                                {formData.email && (
                                    <span className="text-sm">{formData.email}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEmailForm(!showEmailForm)}
                                className="items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                                {showEmailForm ? "Hide" : formData.email ? "Edit" : "Add email"}
                            </button>
                        </div>

                        {showEmailForm && (
                            <div className="mt-3">
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Rest of the review content */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-medium">Payment Details</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {formData.paymentMethod === "fiat" ? "Bank Transfer" :
                                formData.paymentMethod === "ewallet" ? "E-Wallet" : "Blockchain"}
                        </span>
                    </div>

                    {formData.paymentMethod === "fiat" ? (
                        <FiatDetails formData={formData} />
                    ) : formData.paymentMethod === "ewallet" ? (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">E-Wallet Provider</label>
                                <p className="text-xs mt-1">{formData.ewalletProvider?.toUpperCase()}</p>
                            </div>
                            {formData.ewalletProvider === "coins_ph" && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Account Number</label>
                                    <p className="text-xs mt-1">{formData.accountNumber}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Mobile Number</label>
                                <p className="text-xs mt-1">{formData.mobileNumber}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Network</label>
                                <p className="text-xs mt-1">{formData.network}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Wallet Address</label>
                                <p className="text-xs mt-1 font-mono">
                                    {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="rounded-lg border border-gray-200">
                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-gray-900">Billing address</h3>
                            <p className="text-[13px] text-gray-500">Required for tax compliance and invoicing</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="text-xs"
                        >
                            {showAddressForm ? (
                                <>
                                    <X className="size-3 mr-1.5" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Plus className="size-3 mr-1.5" />
                                    Add address
                                </>
                            )}
                        </Button>
                    </div>

                    {showAddressForm && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleAddressChange}
                                        placeholder="Street address"
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleAddressChange}
                                        placeholder="City"
                                        className="w-full"
                                    />
                                    <Input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleAddressChange}
                                        placeholder="State/Province"
                                        className="w-full"
                                    />
                                </div>

                                <Input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleAddressChange}
                                    placeholder="ZIP/Postal code"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    {!showAddressForm && formData.street && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-start gap-3">
                                <Building2 className="size-4 text-gray-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">{formData.street}</p>
                                    <p className="text-sm text-gray-600">{formData.city}, {formData.state} {formData.zipCode}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}