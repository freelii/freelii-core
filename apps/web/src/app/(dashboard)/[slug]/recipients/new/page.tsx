"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { NavSteps } from "@/ui/shared/nav-steps"
import { Button, ExpandingArrow, Input, LoadingDots, MaxWidthWrapper, useRouterStuff } from "@freelii/ui"
import { cn } from "@freelii/utils"
import { ArrowLeft } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface FormData {
    type: "company" | "person"
    name: string
    email: string
    taxNumber: string
    street: string
    city: string
    state: string
    country: string
    zipCode: string
    paymentMethod: "fiat" | "ewallet" | "blockchain"
    transferMethod?: "instapay" | "pesonet"
    ewalletProvider?: "gcash" | "maya" | "coins_ph"
    mobileNumber?: string
    swiftCode?: string
    bankAddress?: string
    purposeOfPayment?: string
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: "checking" | "savings"
    accountHolderName: string
    walletAddress: string
    network: "stellar"
}

export default function NewRecipientPage() {
    const { router, searchParams } = useRouterStuff();
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<FormData>({
        type: "person",
        name: "",
        email: "",
        taxNumber: "",
        street: "",
        city: "",
        state: "",
        country: "",
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
    })

    // tRPC procedures
    const createRecipient = api.clients.create.useMutation({
        onError: ClientTRPCErrorHandler,
    })


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log(formData)
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
        { id: 2, name: "Address Details", component: AddressStep },
        { id: 3, name: "Banking Details", component: BankingStep },
        { id: 4, name: "Review", component: ReviewStep },
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
                                {steps[currentStep]?.component({ formData, setFormData })}
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
                                            <p className="font-medium text-sm">Address Details</p>
                                            <p className="text-xs text-gray-500">
                                                {formData.city && formData.country ?
                                                    `${formData.city}, ${formData.country}` :
                                                    'Pending'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 3 ? 'border-[#4ab3e8]' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 3 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Banking Details</p>
                                            <p className="text-xs text-gray-500">
                                                {currentStep === 3 ? 'In Progress' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 4 ? 'border-[#4ab3e8]' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 4 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Review & Confirm</p>
                                            <p className="text-xs text-gray-500">
                                                {currentStep === 4 ? 'In Progress' : 'Pending'}
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

function BasicInfoStep({ formData, setFormData }: { formData: FormData, setFormData: (data: FormData) => void }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
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
                        placeholder={formData.type === "company" ? "Company Name" : "John Doe"}
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                {formData.type === "company" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Tax Number</label>
                        <Input
                            type="text"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleChange}
                            placeholder="VAT/Tax ID"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

function AddressStep({ formData, setFormData }: { formData: FormData, setFormData: (data: FormData) => void }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Address Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Street Address</label>
                    <Input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="123 Main St"
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <Input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">State/Province</label>
                        <Input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <CountrySelect
                            value={formData.country}
                            onChange={(country) => setFormData({ ...formData, country })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ZIP/Postal Code</label>
                        <Input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            placeholder="ZIP Code"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
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
        { name: "Brazil", currencyCode: "BRL", },
        { name: "Argentina", currencyCode: "ARS", },
        { name: "Colombia", currencyCode: "COP", },
        { name: "United States", currencyCode: "USD", },
        { name: "Singapore", currencyCode: "SGD", },
        { name: "Japan", currencyCode: "JPY", },
        { name: "Hong Kong", currencyCode: "HKD", },
        { name: "Australia", currencyCode: "AUD", },
        { name: "China", currencyCode: "CNY", },
        // Add more countries as needed
    ]

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase())
    )

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
            }
        } else if (e.key === "Escape") {
            setIsOpen(false)
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
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setIsOpen(true)
                        setHighlightedIndex(0)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search countries"
                    className="w-full pl-10"
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FlagIcon size={16} currencyCode={countries.find(c => c.name === value)?.currencyCode ?? ""} />
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

function BankingStep({ formData, setFormData }: { formData: FormData, setFormData: (data: FormData) => void }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Information</h2>

            {/* Philippines Payment Options Banner */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center gap-2">
                <FlagIcon currencyCode="PHP" size={20} />
                <p className="text-sm text-gray-600">
                    These payment options are available for recipients in the Philippines
                </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setFormData({ ...formData, paymentMethod: "fiat" })}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${formData.paymentMethod === "fiat"
                            ? "border-[#4ab3e8] text-[#4ab3e8]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Local Bank Transfer
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, paymentMethod: "ewallet" })}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${formData.paymentMethod === "ewallet"
                            ? "border-[#4ab3e8] text-[#4ab3e8]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        E-Wallet
                    </button>
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                        <Input
                            type="text"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleChange}
                            placeholder="Exact name on bank account"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bank Name</label>
                        <select
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md text-gray-500 text-sm border-zinc-200"
                        >
                            <option value="">Select Bank</option>
                            <option value="BDO">BDO</option>
                            <option value="BPI">BPI</option>
                            <option value="UnionBank">UnionBank</option>
                            <option value="Metrobank">Metrobank</option>
                            <option value="Landbank">Landbank</option>
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

function ReviewStep({ formData }: { formData: FormData }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Information</h2>
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Type</label>
                        <p className="mt-1 font-medium">{formData.type === "company" ? "Company" : "Person"}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Name</label>
                        <p className="mt-1 font-medium">{formData.name}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-xs font-medium text-gray-500">Email</label>
                    <p className="mt-1 font-medium">{formData.email}</p>
                </div>

                {formData.type === "company" && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500">Tax Number</label>
                        <p className="mt-1 font-medium">{formData.taxNumber ?? "Not provided"}</p>
                    </div>
                )}

                <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium mb-3">Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                        <p className="text-gray-600 text-xs">{formData.street}</p>
                        <p className="text-gray-600 text-xs">{formData.city}, {formData.state}</p>
                        <p className="text-gray-600 text-xs">{formData.country}, {formData.zipCode}</p>
                    </div>
                </div>

                <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium mb-3">Payment Details</h3>
                    {formData.paymentMethod === "fiat" ? (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Account Holder</label>
                                <p className="text-xs mt-1">{formData.accountHolderName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Bank</label>
                                <p className="text-xs mt-1">{formData.bankName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Account Type</label>
                                <p className="text-xs mt-1 capitalize">{formData.accountType}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Account Number</label>
                                <p className="text-xs mt-1">****{formData.accountNumber.slice(-4)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Routing Number</label>
                                <p className="text-xs mt-1">****{formData.routingNumber.slice(-4)}</p>
                            </div>
                        </div>
                    ) : formData.paymentMethod === "ewallet" ? (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">E-Wallet Provider</label>
                                <p className="text-xs mt-1">{formData.ewalletProvider?.toUpperCase()}</p>
                            </div>
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
            </div>
        </div>
    )
}   