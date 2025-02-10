"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { FiatDetails } from "@/ui/render-fiat-details"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { NavSteps } from "@/ui/shared/nav-steps"
import { Button, ExpandingArrow, Input, LoadingDots, MaxWidthWrapper, useRouterStuff } from "@freelii/ui"
import { cn } from "@freelii/utils"
import { ArrowLeft } from "lucide-react"
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
        { id: 1, name: "Basic Information", component: BasicInfoStep },
        { id: 2, name: "Payment Details", component: BankingStep },
        { id: 3, name: "Review", component: ReviewStep },
    ]

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    return (
        <PageContent
            title="Register Recipient"
            className="bg-gray-50 pb-10"
            titleBackButtonLink="./"
        >
            <MaxWidthWrapper>
                <div className="space-y-6">
                    <NavSteps currentStep={currentStep} steps={steps} setStep={setCurrentStep} />
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-8">
                            <div className="bg-white py-2 px-6 border-l border-gray-200">
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
                            </div>
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

                        <div className="col-span-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold mb-6">Progress</h2>

                                {/* Timeline */}
                                <div className="mt-6">
                                    <div className="relative pl-8 border-l-2 border-[#4ab3e8] pb-6">
                                        <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full bg-[#4ab3e8]" />
                                        <div>
                                            <p className="font-medium text-sm">Select Type</p>
                                            <p className="text-xs text-gray-500">
                                                {formData.type ? formData.type === "company" ? "Business Account" : "Personal Account" : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 1 ? 'border-[#4ab3e8]' : 'border-gray-200'} pb-6`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 1 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Basic Information</p>
                                            <p className="text-xs text-gray-500">
                                                {formData.name ? `${formData.name}${formData.email ? ` • ${formData.email}` : ''}` : 'Pending'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 2 ? 'border-[#4ab3e8]' : 'border-gray-200'} pb-6`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 2 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Payment Details</p>
                                            <p className="text-xs text-gray-500">
                                                {currentStep === 2 ? 'In Progress' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 3 ? 'border-[#4ab3e8]' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 3 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Review & Confirm</p>
                                            <p className="text-xs text-gray-500">
                                                {currentStep === 3 ? 'In Progress' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional info */}
                                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">
                                        Complete all steps to register your new recipient. You can edit these details later.
                                    </p>
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
            <h2 className="text-xl font-semibold">Select Recipient Type</h2>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "person" })}
                    className={`p-6 border rounded-lg text-left ${formData.type === "person" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                >
                    <h3 className="font-medium mb-2">Person</h3>
                    <p className="text-sm text-gray-500">Individual recipient for personal invoicing</p>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "company" })}
                    className={`p-6 border rounded-lg text-left ${formData.type === "company" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                >
                    <h3 className="font-medium mb-2">Company</h3>
                    <p className="text-sm text-gray-500">Business or organization for professional invoicing</p>
                </button>
            </div>


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
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {formData.type === "company" ? "Company Name" : "Full Name"}
                    </label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={formData.type === "company" ? "Legal business name" : "Full name as shown on ID"}
                        className="w-full p-2 border rounded-md"
                    />
                </div>



                <div className="mt-8">
                    <h3 className="text-sm font-medium mb-3">Recipient&apos;s Country</h3>
                    <p className="text-sm text-gray-500 mb-4">This will determine available payment methods</p>
                    <CountrySelect
                        value={formData.country}
                        onChange={(country) => setFormData({ ...formData, country: country as "Philippines" | "Mexico" | "United States" })}
                    />
                </div>
                {formData.type === "company" && (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <label className="block text-sm font-medium">Tax Number</label>
                            <div className="relative group">
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06 2.75 2.75 0 013.82 0 .75.75 0 01-1.06 1.06 1.25 1.25 0 00-1.7 0zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-xs text-white rounded shadow-lg">
                                    {getTaxNumberHint()}
                                </div>
                            </div>
                        </div>
                        <Input
                            type="text"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleChange}
                            placeholder={getTaxNumberHint()}
                            className="w-full p-2 border rounded-md"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Required for tax compliance and invoicing
                        </p>
                    </div>
                )}
                <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium">Contact Email</h3>
                        <button
                            type="button"
                            onClick={() => setShowEmailForm(!showEmailForm)}
                            className="items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            {showEmailForm ? "Hide" : "Add email for notifications"}
                        </button>
                    </div>

                    {showEmailForm ? (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="Contact email for payment notifications"
                                    className="w-full"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Add an email to receive payment notifications and invoices
                                </p>
                            </div>
                        </div>
                    ) : formData.email ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 text-xs">{formData.email}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">No email provided</p>
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
            <h2 className="text-xl font-semibold">Payment Information</h2>

            {/* Country-specific Payment Options Banner */}
            {countryInfo && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center gap-2">
                    {countryInfo.icon}
                    <p className="text-sm text-gray-600">
                        {countryInfo.message}
                    </p>
                </div>
            )}

            {/* Payment Method Tabs - Show different options based on country */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setFormData({ ...formData, paymentMethod: "fiat" })}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${formData.paymentMethod === "fiat"
                            ? "border-[#4ab3e8] text-[#4ab3e8]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        {formData.country === "Mexico" ? "SPEI Transfer" :
                            formData.country === "United States" ? "Bank Transfer (ACH/Wire)" :
                                "Local Bank Transfer"}
                    </button>
                    {formData.country === "Philippines" && (
                        <>
                            <button
                                onClick={() => setFormData({ ...formData, paymentMethod: "ewallet" })}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${formData.paymentMethod === "ewallet"
                                    ? "border-[#4ab3e8] text-[#4ab3e8]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                E-Wallet
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setFormData({ ...formData, paymentMethod: "blockchain" })}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${formData.paymentMethod === "blockchain"
                            ? "border-[#4ab3e8] text-[#4ab3e8]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Blockchain
                    </button>
                </div>
            </div>

            {/* Conditional Form Content */}
            {formData.paymentMethod === "fiat" && (
                <div className="space-y-4">
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium">Account Holder Name</h3>
                            <button
                                type="button"
                                onClick={() => setShowAccountHolderNameForm(!showAccountHolderNameForm)}
                                className="items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                                {showAccountHolderNameForm ? "Hide" : "Use different name"}
                            </button>
                        </div>

                        {showAccountHolderNameForm ? (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                <div>
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
                                    <div className="mt-2 flex items-start gap-1.5">
                                        <p className="text-xs text-gray-500">
                                            This name will be different from the recipient name ({formData.name})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : formData.name ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-xs">{formData.accountHolderName.length > 0 ? formData.accountHolderName : formData.name}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No name provided</p>
                        )}
                    </div>

                    {formData.country === "Mexico" ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">CLABE</label>
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
                        <label className="block text-sm font-medium mb-1">E-Wallet Provider</label>
                        <div className="grid grid-cols-3 gap-4">
                            {["gcash", "maya", "coins_ph"].map((provider) => (
                                <button
                                    key={provider}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, ewalletProvider: provider as "gcash" | "maya" | "coins_ph" })}
                                    className={`p-4 border rounded-lg text-left ${formData.ewalletProvider === provider ? "border-[#4ab3e8] bg-blue-50" : ""
                                        }`}
                                >
                                    <h3 className="font-medium">{provider.toUpperCase()}</h3>
                                </button>
                            ))}
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">Mobile Number</label>
                        <Input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="+63 XXX XXX XXXX"
                            className="w-full"
                        />
                    </div>
                    {formData.ewalletProvider === "coins_ph" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number</label>
                            <Input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                placeholder="10-16 digit account number"
                                className="w-full"
                                maxLength={16}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Enter the 10-16 digit account number for your Coins.ph account
                            </p>
                        </div>
                    )}

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
            <h2 className="text-xl font-semibold">Review Information</h2>
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
                <div className="border-t pt-4 mt-8 group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium">Billing Address</h3>
                        <button
                            type="button"
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="items-center flex rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            {showAddressForm ? "Hide" : "Add address for invoicing"}
                            <span className="hidden font-bold ml-1 group-hover:block transition-all duration-900">
                                +
                            </span>
                        </button>
                    </div>

                    {showAddressForm ? (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Street Address</label>
                                <Input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleAddressChange}
                                    placeholder="123 Main St"
                                    className="w-full mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">City</label>
                                    <Input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleAddressChange}
                                        placeholder="City"
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">State/Province</label>
                                    <Input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleAddressChange}
                                        placeholder="State"
                                        className="w-full mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500">ZIP/Postal Code</label>
                                <Input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleAddressChange}
                                    placeholder="ZIP Code"
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>
                    ) : formData.street ? (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                            <p className="text-gray-600 text-xs">{formData.street}</p>
                            <p className="text-gray-600 text-xs">{formData.city}, {formData.state}</p>
                            <p className="text-gray-600 text-xs">{formData.zipCode}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">No address provided</p>
                    )}
                </div>
            </div>
        </div>
    )
}