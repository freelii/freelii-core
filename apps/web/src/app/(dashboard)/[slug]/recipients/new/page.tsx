"use client"

import { PageContent } from "@/ui/layout/page-content"
import { NavSteps } from "@/ui/shared/nav-steps"
import { Button, ExpandingArrow, Input, MaxWidthWrapper } from "@freelii/ui"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

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
}

export default function NewRecipientPage() {
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
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log(formData)
        // TODO: Implement the API call to create a new recipient
    }

    const steps = [
        { id: 0, name: "Recipient Type", component: TypeStep },
        { id: 1, name: "Basic Information", component: BasicInfoStep },
        { id: 2, name: "Address Details", component: AddressStep },
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
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                {steps[currentStep].component({ formData, setFormData })}
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

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </button>
                        {currentStep !== steps.length - 1 ? (
                            <Button
                                variant="outline"
                                onClick={nextStep}
                                className="group flex items-center px-4 py-2"
                            >
                                Next
                                <ExpandingArrow className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleSubmit}
                            >
                                Register Recipient
                            </Button>
                        )}
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
                        <Input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Country"
                            className="w-full p-2 border rounded-md"
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

function ReviewStep({ formData }: { formData: FormData }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Information</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Type</label>
                        <p className="mt-1">{formData.type === "company" ? "Company" : "Person"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1">{formData.name}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1">{formData.email}</p>
                </div>

                {formData.type === "company" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Tax Number</label>
                        <p className="mt-1">{formData.taxNumber || "Not provided"}</p>
                    </div>
                )}

                <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-3">Address</h3>
                    <p className="text-gray-600">{formData.street}</p>
                    <p className="text-gray-600">{formData.city}, {formData.state}</p>
                    <p className="text-gray-600">{formData.country}, {formData.zipCode}</p>
                </div>
            </div>
        </div>
    )
}   