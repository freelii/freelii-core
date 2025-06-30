"use client"

import { ClientTRPCErrorHandler } from "@/lib/client-trpc-error-handler"
import { api } from "@/trpc/react"
import { PageContent } from "@/ui/layout/page-content"
import { FiatDetails } from "@/ui/render-fiat-details"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { NavSteps } from "@/ui/shared/nav-steps"
import { Button, ExpandingArrow, Input, LoadingDots, MaxWidthWrapper, useRouterStuff } from "@freelii/ui"
import { cn } from "@freelii/utils"
import { ArrowLeft, Check } from "lucide-react"
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
    coinsPhAccount?: string
}

export default function LinkWithdrawalMethodPage() {
    const { router } = useRouterStuff()
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<WithdrawalMethodFormData>({
        paymentMethod: "fiat",
        currency: "USD",
        country: "",
    })
    const [isSuccess, setIsSuccess] = useState(false)

    // tRPC procedures
    const linkWithdrawalAccount = api.users.linkWithdrawalAccount.useMutation({
        onError: ClientTRPCErrorHandler,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await linkWithdrawalAccount.mutateAsync(formData)
            setIsSuccess(true)
            // Delay redirect to show success state
            setTimeout(() => {
                void router.push(`./`)
            }, 1000)
        } catch (_e) {
            setIsSuccess(false)
        }
    }

    const steps = [
        { id: 0, name: "Select Type", component: TypeStep },
        { id: 1, name: "Payment Details", component: PaymentDetailsStep },
        { id: 2, name: "Review", component: ReviewStep },
    ]

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    return (
        <PageContent>
            <MaxWidthWrapper>
                <div className="space-y-6">
                    <NavSteps currentStep={currentStep} steps={steps} setStep={setCurrentStep} backButtonLink="./" backButtonText="Withdrawals" />
                    <div className="grid grid-cols-12 gap-6 ">
                        <div className="col-span-8">
                            <div className="bg-white py-2 px-6 ">
                                {steps[currentStep]?.component({ formData, setFormData })}
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
                                            disabled={linkWithdrawalAccount.isPending || isSuccess}
                                            className={cn(
                                                "relative",
                                                (linkWithdrawalAccount.isPending || isSuccess) && "cursor-not-allowed",
                                                isSuccess && "border-green-500 bg-green-50 text-green-600",
                                            )}
                                        >
                                            <div className={cn(
                                                "flex items-center gap-2 transition-opacity",
                                                (linkWithdrawalAccount.isPending || isSuccess) && "opacity-0"
                                            )}>
                                                Save Withdrawal Method
                                            </div>

                                            {/* Loading State */}
                                            {linkWithdrawalAccount.isPending && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <LoadingDots className="h-4 w-4" color="black" />
                                                </div>
                                            )}

                                            {/* Success State */}
                                            {isSuccess && (
                                                <div className="absolute inset-0 flex items-center justify-center text-green-600">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="h-4 w-4" />
                                                        <span className="text-sm">Saved Successfully</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress sidebar */}
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
                                    <div className="relative pl-8 border-l-2 border-blue-600 pb-6">
                                        <div className="absolute left-0 -translate-x-[10px] size-[18px] rounded-full bg-blue-600 ring-4 ring-blue-50" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-[13px] text-gray-900">Payment Type</p>
                                                {formData.country && (
                                                    <span className="text-[12px] text-gray-500">• {formData.country}</span>
                                                )}
                                            </div>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {formData.paymentMethod ? (
                                                    formData.paymentMethod === "fiat" ? "Bank Transfer" :
                                                        formData.paymentMethod === "ewallet" ? "E-Wallet" :
                                                            "Blockchain"
                                                ) : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8 border-l-2 pb-6 
                                        ${currentStep >= 1 ? 'border-blue-600' : 'border-gray-200'}`}
                                    >
                                        <div className={`absolute left-0 -translate-x-[10px] size-[18px] rounded-full 
                                            ${currentStep >= 1
                                                ? 'bg-blue-600 ring-4 ring-blue-50'
                                                : 'border-2 border-gray-300 bg-white'
                                            }`}
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium text-[13px] ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    Payment Details
                                                </p>
                                                {currentStep >= 1 && formData.paymentMethod === "fiat" && formData.bankName && (
                                                    <span className="text-[12px] text-gray-500">• {formData.bankName}</span>
                                                )}
                                            </div>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {currentStep >= 1 ? (
                                                    formData.paymentMethod === "fiat" ? (
                                                        formData.transferMethod === "instapay" ? "InstaPay transfer" :
                                                            formData.transferMethod === "pesonet" ? "PESONet transfer" :
                                                                "Bank account information"
                                                    ) :
                                                        formData.paymentMethod === "ewallet" ? (
                                                            formData.ewalletProvider === "gcash" ? "GCash wallet" :
                                                                formData.ewalletProvider === "maya" ? "Maya wallet" :
                                                                    formData.ewalletProvider === "coins_ph" ? "Coins.ph wallet" :
                                                                        "E-wallet details"
                                                        ) :
                                                            "Wallet address"
                                                ) : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`relative pl-8`}
                                    >
                                        <div className={`absolute left-0 -translate-x-[8px] size-[18px] rounded-full 
                                            ${currentStep >= 2
                                                ? 'bg-blue-600 ring-4 ring-blue-50'
                                                : 'border-2 border-gray-300 bg-white'
                                            }`}
                                        />
                                        <div>
                                            <p className={`font-medium text-[13px] ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Review & Confirm
                                            </p>
                                            <p className="text-[13px] text-gray-500 mt-0.5">
                                                {currentStep === 2 ? (
                                                    formData.accountHolderName ?
                                                        `Verify details for ${formData.accountHolderName}` :
                                                        "Verify your information"
                                                ) : "Pending"}
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
        <div className="space-y-8">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">Select Payment Method</h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Choose how you want to receive your withdrawals.
                </p>
            </div>

            <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Withdrawal Country
                </label>
                <p className="text-[13px] text-gray-500 mb-3">
                    This will determine available withdrawal methods
                </p>
                <CountrySelect
                    value={formData.country}
                    onChange={(country) => {
                        const currency = country === "Philippines" ? "PHP" :
                            country === "Mexico" ? "MXN" : "USD"
                        const paymentMethod = (country !== "Philippines" && formData.paymentMethod === "ewallet") ? "fiat" : formData.paymentMethod
                        setFormData({ ...formData, country, currency, paymentMethod })
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
                                    Withdraw to your bank account
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
                                    Withdraw to crypto wallet
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
        <div className="space-y-8">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">Payment Details</h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Enter your payment information to receive withdrawals.
                </p>
            </div>

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

            {formData.paymentMethod === "fiat" && (
                <div className="space-y-6">
                    <div className="grid gap-6">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                Account Holder Name
                            </label>
                            <Input
                                type="text"
                                name="accountHolderName"
                                value={formData.accountHolderName}
                                onChange={handleChange}
                                placeholder="Full legal name"
                                className="w-full h-[36px] shadow-sm text-[15px]"
                            />
                        </div>

                        {formData.country === "Mexico" && (
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                    CLABE
                                </label>
                                <Input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="18-digit CLABE number"
                                    className="w-full h-[36px] shadow-sm font-mono text-[15px]"
                                    maxLength={18}
                                />
                                <p className="mt-2 text-[13px] text-gray-500">
                                    Your CLABE is an 18-digit number used for bank transfers in Mexico
                                </p>
                            </div>
                        )}

                        {formData.country === "United States" && (
                            <>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Bank Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        placeholder="e.g. Chase, Wells Fargo"
                                        className="w-full h-[36px] shadow-sm text-[15px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Account Type
                                    </label>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {["checking", "savings"].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, accountType: type as "checking" | "savings" })}
                                                className={`flex items-center p-4 border rounded-lg hover:border-gray-300 transition-colors
                                                    ${formData.accountType === type
                                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                        : "border-gray-200"}`}
                                            >
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-gray-900 capitalize">
                                                        {type}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {type === "checking" ? "Personal or business" : "Personal savings"}
                                                    </p>
                                                </div>
                                                <div className={`size-5 rounded-full border flex items-center justify-center
                                                    ${formData.accountType === type
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-gray-300"}`}
                                                >
                                                    {formData.accountType === type && (
                                                        <div className="size-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Routing Number
                                    </label>
                                    <Input
                                        type="text"
                                        name="routingNumber"
                                        value={formData.routingNumber}
                                        onChange={handleChange}
                                        placeholder="9 digits"
                                        className="w-full h-[36px] shadow-sm font-mono text-[15px]"
                                        maxLength={9}
                                    />
                                    <p className="mt-2 text-[13px] text-gray-500">
                                        9-digit code that identifies your bank
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Account Number
                                    </label>
                                    <Input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        placeholder="Enter account number"
                                        className="w-full h-[36px] shadow-sm font-mono text-[15px]"
                                    />
                                </div>
                            </>
                        )}

                        {formData.country === "Philippines" && (
                            <>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Bank Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        placeholder="e.g. BDO, BPI, UnionBank"
                                        className="w-full h-[36px] shadow-sm text-[15px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Account Number
                                    </label>
                                    <Input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        placeholder="Enter account number"
                                        className="w-full h-[36px] shadow-sm font-mono text-[15px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                        Transfer Method
                                    </label>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            { id: "instapay", label: "InstaPay", description: "Instant transfer (₱5 fee)" },
                                            { id: "pesonet", label: "PESONet", description: "Same-day transfer (free)" }
                                        ].map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, transferMethod: method.id as "instapay" | "pesonet" })}
                                                className={`flex items-center p-4 border rounded-lg hover:border-gray-300 transition-colors
                                                    ${formData.transferMethod === method.id
                                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                        : "border-gray-200"}`}
                                            >
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-[15px] text-gray-900">
                                                        {method.label}
                                                    </p>
                                                    <p className="text-[13px] text-gray-500 mt-0.5">
                                                        {method.description}
                                                    </p>
                                                </div>
                                                <div className={`size-5 rounded-full border flex items-center justify-center
                                                    ${formData.transferMethod === method.id
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-gray-300"}`}
                                                >
                                                    {formData.transferMethod === method.id && (
                                                        <div className="size-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {formData.paymentMethod === "ewallet" && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                            E-Wallet Provider
                        </label>
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
                                    value={formData.coinsPhAccount}
                                    onChange={(e) => setFormData({ ...formData, coinsPhAccount: e.target.value })}
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
        <div className="space-y-8">
            <div className="border-b pb-4">
                <h2 className="text-[28px] text-gray-900 font-medium leading-9">Review Information</h2>
                <p className="mt-1 text-[15px] text-gray-600">
                    Please verify your payment details before continuing.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700">Withdrawal Method</label>
                                <p className="mt-1 text-[15px] text-gray-900">
                                    {formData.paymentMethod === "fiat" ? "Bank Transfer" :
                                        formData.paymentMethod === "ewallet" ? "E-Wallet" :
                                            "Blockchain"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <FlagIcon currencyCode={formData.currency} size={20} />
                                <span className="text-[15px] font-medium text-gray-900">{formData.currency}</span>
                            </div>
                        </div>
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
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="divide-y divide-gray-200">
                            <div className="px-6 py-4">
                                <label className="block text-[13px] font-medium text-gray-700">E-Wallet Provider</label>
                                <p className="mt-1 text-[15px] text-gray-900">
                                    {formData.ewalletProvider === "gcash" ? "GCash" :
                                        formData.ewalletProvider === "maya" ? "Maya" :
                                            "Coins.ph"}
                                </p>
                            </div>
                            <div className="px-6 py-4">
                                <label className="block text-[13px] font-medium text-gray-700">Mobile Number</label>
                                <p className="mt-1 text-[15px] font-mono text-gray-900">{formData.mobileNumber}</p>
                            </div>
                        </div>
                    </div>
                )}

                {formData.paymentMethod === "blockchain" && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="divide-y divide-gray-200">
                            <div className="px-6 py-4">
                                <label className="block text-[13px] font-medium text-gray-700">Network</label>
                                <p className="mt-1 text-[15px] text-gray-900">
                                    Stellar (XLM)
                                </p>
                            </div>
                            <div className="px-6 py-4">
                                <label className="block text-[13px] font-medium text-gray-700">Wallet Address</label>
                                <p className="mt-1 text-[15px] font-mono text-gray-900">
                                    {formData.walletAddress?.slice(0, 6)}...{formData.walletAddress?.slice(-4)}
                                </p>
                            </div>
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
