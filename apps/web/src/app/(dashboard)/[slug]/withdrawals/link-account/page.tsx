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
import { useState } from "react"

export interface WithdrawalMethodFormData {
    paymentMethod: "fiat" | "ewallet" | "blockchain"
    bankName?: string
    accountNumber?: string
    accountHolderName?: string
    routingNumber?: string
    accountType?: "checking" | "savings"
    transferMethod?: "instapay" | "pesonet"
    ewalletProvider?: "gcash" | "maya" | "coins_ph"
    mobileNumber?: string
    walletAddress?: string
    network?: "stellar"
    currency: "USD" | "PHP" | "MXN"
    country: string
}

export default function LinkWithdrawalMethodPage() {
    const { router } = useRouterStuff()
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<WithdrawalMethodFormData>({
        paymentMethod: "fiat",
        currency: "USD",
        country: "",
    })

    // tRPC procedures
    const linkWithdrawalAccount = api.users.linkWithdrawalAccount.useMutation({
        onError: ClientTRPCErrorHandler,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await linkWithdrawalAccount.mutateAsync(formData)
        void router.push(`./`)
    }

    const steps = [
        { id: 0, name: "Select Type", component: TypeStep },
        { id: 1, name: "Payment Details", component: PaymentDetailsStep },
        { id: 2, name: "Review", component: ReviewStep },
    ]

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    return (
        <PageContent
            title="Link Account"
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
                                        className={cn(linkWithdrawalAccount.isPending && "opacity-50 cursor-not-allowed py-3")}
                                    >
                                        {linkWithdrawalAccount.isPending ?
                                            <LoadingDots className="h-4 w-4" color="white" />
                                            : "Link Method"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Progress sidebar */}
                        <div className="col-span-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold mb-6">Progress</h2>
                                <div className="mt-6">
                                    <div className="relative pl-8 border-l-2 border-[#4ab3e8] pb-6">
                                        <div className="absolute left-0 -translate-x-[9px] size-4 rounded-full bg-[#4ab3e8]" />
                                        <div>
                                            <p className="font-medium text-sm">Payment Type</p>
                                            <p className="text-xs text-gray-500">
                                                {formData.paymentMethod ? formData.paymentMethod.toUpperCase() : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 1 ? 'border-[#4ab3e8]' : 'border-gray-200'} pb-6`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 1 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Payment Details</p>
                                            <p className="text-xs text-gray-500">
                                                {currentStep >= 1 ? 'In Progress' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 ${currentStep >= 2 ? 'border-[#4ab3e8]' : 'border-gray-200'}`}>
                                        <div className={`absolute left-0 -translate-x-[9px] size-4 rounded-full ${currentStep >= 2 ? 'bg-[#4ab3e8]' : 'border-2 border-gray-200 bg-white'}`} />
                                        <div>
                                            <p className="font-medium text-sm">Review & Confirm</p>
                                            <p className="text-xs text-gray-500">
                                                {currentStep === 2 ? 'In Progress' : 'Pending'}
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

function TypeStep({ formData, setFormData }: { formData: WithdrawalMethodFormData, setFormData: (data: WithdrawalMethodFormData) => void }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select Payment Method</h2>

            <div>
                <h3 className="text-sm font-medium mb-3">Withdrawal Country</h3>
                <p className="text-sm text-gray-500 mb-4">This will determine available withdrawal methods</p>
                <CountrySelect
                    value={formData.country}
                    onChange={(country) => {
                        const currency = country === "Philippines" ? "PHP" :
                            country === "Mexico" ? "MXN" : "USD"
                        // Reset type if switching from Philippines and e-wallet was selected
                        const paymentMethod = (country !== "Philippines" && formData.paymentMethod === "ewallet") ? "fiat" : formData.paymentMethod
                        setFormData({ ...formData, country, currency, paymentMethod })
                    }}
                />
            </div>

            {formData.country && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-sm font-medium mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMethod: "fiat" })}
                            className={`p-6 border rounded-lg text-left ${formData.paymentMethod === "fiat" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                        >
                            <h3 className="font-medium mb-2">Bank Transfer</h3>
                            <p className="text-sm text-gray-500">Withdraw to your bank account</p>
                        </button>
                        {formData.country === "Philippines" && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: "ewallet" })}
                                className={`p-6 border rounded-lg text-left ${formData.paymentMethod === "ewallet" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                            >
                                <h3 className="font-medium mb-2">E-Wallet</h3>
                                <p className="text-sm text-gray-500">GCash, Maya, or Coins.ph</p>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMethod: "blockchain" })}
                            className={`p-6 border rounded-lg text-left ${formData.paymentMethod === "blockchain" ? "border-[#4ab3e8] bg-blue-50" : ""}`}
                        >
                            <h3 className="font-medium mb-2">Blockchain</h3>
                            <p className="text-sm text-gray-500">Withdraw to crypto wallet</p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function PaymentDetailsStep({ formData, setFormData }: { formData: WithdrawalMethodFormData, setFormData: (data: WithdrawalMethodFormData) => void }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Get country-specific payment info
    const getCountryPaymentInfo = () => {
        switch (formData.country) {
            case "Philippines":
                return {
                    icon: <FlagIcon currencyCode="PHP" size={20} />,
                    message: "These withdrawal options are available for accounts in the Philippines"
                }
            case "Mexico":
                return {
                    icon: <FlagIcon currencyCode="MXN" size={20} />,
                    message: "These withdrawal options are available for accounts in Mexico"
                }
            case "United States":
                return {
                    icon: <FlagIcon currencyCode="USD" size={20} />,
                    message: "These withdrawal options are available for accounts in the United States"
                }
            default:
                return null
        }
    }

    const countryInfo = getCountryPaymentInfo()

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Payment Details</h2>

            {/* Country-specific Payment Options Banner */}
            {countryInfo && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center gap-2">
                    {countryInfo.icon}
                    <p className="text-sm text-gray-600">
                        {countryInfo.message}
                    </p>
                </div>
            )}

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
                                    className={`p-4 border rounded-lg text-left ${formData.ewalletProvider === provider ? "border-[#4ab3e8] bg-blue-50" : ""}`}
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
                            className="w-full p-2 border rounded-md text-gray-500 text-sm border-zinc-200"
                        >
                            <option value="stellar">Stellar (XLM)</option>
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

function ReviewStep({ formData }: { formData: WithdrawalMethodFormData }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Information</h2>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Withdrawal Method</label>
                            <p className="mt-1 font-medium">{formData.paymentMethod.toUpperCase()}</p>
                        </div>
                        <FlagIcon currencyCode={formData.currency} size={24} />
                    </div>
                </div>

                {formData.paymentMethod === "fiat" && (
                    <FiatDetails
                        formData={{
                            country: formData.country as 'Mexico' | 'United States' | 'Philippines',
                            accountHolderName: formData.accountHolderName ?? '',
                            accountNumber: formData.accountNumber ?? '',
                            bankName: formData.bankName ?? '',
                            accountType: formData.accountType ?? 'checking',
                            routingNumber: formData.routingNumber ?? '',
                            transferMethod: formData.transferMethod,
                        }}
                    />
                )}

                {formData.paymentMethod === "ewallet" && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">E-Wallet Provider</label>
                            <p className="mt-1">{formData.ewalletProvider?.toUpperCase()}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Mobile Number</label>
                            <p className="mt-1">{formData.mobileNumber}</p>
                        </div>
                    </div>
                )}

                {formData.paymentMethod === "blockchain" && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Network</label>
                            <p className="mt-1">{formData.network}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Wallet Address</label>
                            <p className="mt-1 font-mono text-sm">
                                {formData.walletAddress?.slice(0, 6)}...{formData.walletAddress?.slice(-4)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Don't forget to import CountrySelect from the previous file
function CountrySelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")

    const countries = [
        { name: "Philippines", currencyCode: "PHP" },
        { name: "Mexico", currencyCode: "MXN" },
        { name: "United States", currencyCode: "USD" },
    ]

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase())
    )

    const selectedCountry = countries.find(c => c.name === value)

    return (
        <div className="relative">
            <div className="relative">
                <Input
                    type="text"
                    value={isOpen ? search : selectedCountry?.name ?? ""}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Select country"
                    className="w-full pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FlagIcon size={16} currencyCode={selectedCountry?.currencyCode ?? ""} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {filteredCountries.map((country) => (
                        <button
                            key={country.name}
                            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100
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
