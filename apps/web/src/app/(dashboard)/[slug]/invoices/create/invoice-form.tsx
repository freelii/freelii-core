"use client"

import { FlagIcon } from "@/ui/shared/flag-icon"
import { NavSteps } from "@/ui/shared/nav-steps"
import {
    Badge,
    BlurImage,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea
} from "@freelii/ui"
import { CURRENCIES } from "@freelii/utils"
import dayjs from "dayjs"
import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import { useState } from "react"
import { DatePicker } from "./date-picker"
import { type Client, type InvoiceFormData, type LineItem } from "./types"

interface InvoiceFormProps {
    formData: InvoiceFormData
    clients?: Client[] // Replace with proper client type
    invoiceTo: Client | undefined
    onChange: (data: Partial<InvoiceFormData>) => void
    addLineItem: () => void
    updateLineItem: (index: number, data: Partial<LineItem>) => void
    removeLineItem: (index: number) => void
}

export function InvoiceForm({ formData, clients = [], onChange }: InvoiceFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showCustomDueDate, setShowCustomDueDate] = useState(false);

    const addLineItem = () => {
        console.log("addLineItem", formData)
        const newLineItem: LineItem = {
            description: "",
            quantity: 1,
            unitPrice: 0,
            amount: 0,
        }
        onChange({
            lineItems: [...formData.lineItems, newLineItem]
        })
    }

    const updateLineItem = (index: number, data: Partial<LineItem>) => {
        const newLineItems = [...formData.lineItems]
        newLineItems[index] = {
            ...newLineItems[index],
            ...data,
            amount: (data.quantity ?? newLineItems[index].quantity) *
                (data.unitPrice ?? newLineItems[index].unitPrice)
        }
        onChange({ lineItems: newLineItems })
    }

    const removeLineItem = (index: number) => {
        onChange({
            lineItems: formData.lineItems.filter((_, i) => i !== index)
        })
    }

    const steps = [
        { id: 0, name: "Client Selection", component: ClientStep, props: { formData, clients, onChange } },
        { id: 1, name: "Invoice Details", component: InvoiceDetailsStep, props: { formData, onChange } },
        { id: 2, name: "Line Items", component: LineItemsStep, props: { formData, onChange, addLineItem, updateLineItem, removeLineItem } },
        {
            id: 3, name: "Payment Details", component: PaymentDetailsStep, props: {
                formData,
                onChange,
                showCustomDueDate,
                setShowCustomDueDate
            }
        },
    ]

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))


    return (
        <div className="space-y-6">
            {/* Progress indicator */}
            <NavSteps currentStep={currentStep} steps={steps} setStep={setCurrentStep} />

            {/* Step content */}
            <div className="border-l-[1px] border-gray-200 pl-4">
                {steps[currentStep]?.component({
                    formData,
                    clients,
                    onChange,
                    invoiceTo: clients.find((client) => client.id === formData.clientId),
                    addLineItem,
                    updateLineItem,
                    removeLineItem,
                    showCustomDueDate,
                    setShowCustomDueDate
                })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

// Step Components
function ClientStep({ formData, clients, onChange }: InvoiceFormProps) {
    return (
        <div className="space-y-4">
            <Label>New invoice for</Label>
            <Select
                value={formData.clientId}
                onValueChange={(value) => onChange({ clientId: value })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                    {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                            {client.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

function InvoiceDetailsStep({ formData, onChange, invoiceTo }: InvoiceFormProps) {
    return (
        <div className="space-y-4">
            <Label>Invoice to</Label>
            {invoiceTo && (
                <div className="flex items-center gap-2 border-none p-2 rounded-lg bg-gray-100">
                    <BlurImage
                        src={invoiceTo.email ?? invoiceTo.name}
                        alt={invoiceTo.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                    <div className="flex flex-col">
                        <div className="font-medium">{invoiceTo.name}</div>
                        <div className="text-sm text-gray-500">{invoiceTo.email}</div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Invoice Number</Label>
                    <Input
                        value={formData.invoiceNumber}
                        onChange={(e) => onChange({ invoiceNumber: e.target.value })}
                    />
                </div>
                <div>
                    <Label>PO Number (Optional)</Label>
                    <Input
                        value={formData.poNumber}
                        onChange={(e) => onChange({ poNumber: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <Label>Currency</Label>
                <Select
                    value={formData.currency}
                    onValueChange={(value) => onChange({ currency: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">
                            <div className="flex items-center gap-2">
                                <FlagIcon currencyCode="USD" /> USD
                            </div>
                        </SelectItem>
                        <SelectItem value="PHP">
                            <div className="flex items-center gap-2">
                                <FlagIcon currencyCode="PHP" /> PHP
                            </div>
                        </SelectItem>
                        <SelectItem value="USDC">
                            <div className="flex items-center gap-2">
                                <FlagIcon currencyCode="USDC" /> USDC
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

function LineItemsStep({ formData, addLineItem, updateLineItem, removeLineItem, onChange }: InvoiceFormProps) {
    return (
        <div className="space-y-4">
            <Label>Line Items</Label>
            <div className="space-y-4">
                {formData.lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Label className="text-sm text-gray-500">Description</Label>
                            <Input
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateLineItem(index, { description: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-sm text-gray-500">Quantity</Label>
                            <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, { quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-3">
                            <Label className="text-sm text-gray-500">Unit Price
                                ({CURRENCIES[formData.currency]?.symbol})
                            </Label>
                            <Input
                                type="number"
                                placeholder="Price"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(index, { unitPrice: e.target.value ? Number(e.target.value) : 0 })}
                            />
                        </div>

                        <div className="col-span-1">
                            <div className="mt-6">
                                <Button
                                    variant="ghost"
                                    className="text-red-700"
                                    onClick={() => removeLineItem(index)}
                                >
                                    x
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
                    />
                </div>
                <Button variant="outline" onClick={addLineItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Line Item
                </Button>
            </div>
        </div>
    )
}

function PaymentDetailsStep({
    formData,
    onChange,
    showCustomDueDate,
    setShowCustomDueDate
}: InvoiceFormProps & {
    showCustomDueDate: boolean,
    setShowCustomDueDate: (show: boolean) => void
}) {
    const repeatOptions = [
        { value: "none", label: "Don't repeat" },
        { value: "weekly", label: `Weekly on ${formData.issueDate?.toLocaleString('en-US', { weekday: 'long' })}` },
        { value: "monthly", label: `Monthly on the ${formData.issueDate?.getDate()}${getDayOfMonthSuffix(formData.issueDate?.getDate())}` },
        { value: "yearly", label: `Yearly on ${formData.issueDate?.toLocaleString('en-US', { month: 'long' })} ${formData.issueDate?.getDate()}` },
    ]

    const handleDueDateChange = (value: string) => {
        if (value === "custom") {
            setShowCustomDueDate(true);
            return;
        }

        setShowCustomDueDate(false);
        const date = value === "today"
            ? new Date()
            : value === "startOfMonth"
                ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                : new Date(Date.now() + parseInt(value.replace("next", "")) * 24 * 60 * 60 * 1000);

        onChange({ dueDate: date });
    }

    return (
        <div className="space-y-4">
            <Label>Payment Details</Label>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Issue Date</Label>
                    <DatePicker
                        date={formData.issueDate}
                        setDate={(date) => onChange({ issueDate: date })}
                    />
                </div>
                <div>
                    <Label>Due Date</Label>
                    {!showCustomDueDate ? (
                        <Select
                            value={getDueDateValue(formData.dueDate)}
                            onValueChange={handleDueDateChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select due date" />
                            </SelectTrigger>
                            <SelectContent>
                                {repeatOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col items-start py-0 my-0">
                                            <span>{option.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2">
                            <DatePicker
                                date={formData.dueDate}
                                setDate={(date) => onChange({ dueDate: date })}
                            />
                            <Button
                                variant="outline"
                                onClick={() => setShowCustomDueDate(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <Label>Repeat Invoice</Label>
                <Select
                    value={formData.repeatSchedule ?? 'none'}
                    onValueChange={(value) => onChange({ repeatSchedule: value === 'none' ? null : value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select repeat schedule" />
                    </SelectTrigger>
                    <SelectContent>
                        {repeatOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                        <SelectItem disabled key={"custom"} value={"custom"} className="flex items-center justify-between bg-gray-100">
                            Custom <Badge className="ml-2" variant="gray">Coming Soon</Badge>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                    value={formData.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                />
            </div>
        </div>
    )
}

// Helper function for day suffixes (1st, 2nd, 3rd, etc.)
function getDayOfMonthSuffix(day: number | undefined) {
    if (!day) return '';
    if (day >= 11 && day <= 13) return 'th';

    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Helper function to calculate future dates
function calculateFutureDate(baseDate: Date, days: number): string {
    const date = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Helper function to determine the current due date value
function getDueDateValue(date: Date | null): string {
    if (!date) return "today";

    // If the due date is in the next month, return "startOfMonth"
    if (dayjs(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)).isSame(date, 'day')) {
        return "startOfMonth";
    }

    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (diffDays) {
        case 0:
            return "today";
        case 30:
            return "next30";
        case 60:
            return "next60";
        case 90:
            return "next90";
        default:
            return "custom";
    }
} 