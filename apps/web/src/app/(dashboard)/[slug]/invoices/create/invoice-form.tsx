"use client"

import { api } from "@/trpc/react"
import { FlagIcon } from "@/ui/shared/flag-icon"
import { NavSteps } from "@/ui/shared/nav-steps"
import {
    ArrowsOppositeDirectionX,
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
import { Address, Client } from "@prisma/client"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArrowLeft, ArrowRight, Clock, Plus } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { DatePicker } from "./date-picker"
import { type InvoiceFormData, type LineItem } from "./types"

dayjs.extend(relativeTime)

interface InvoiceFormProps {
    formData: InvoiceFormData
    clients?: Client[]
    invoiceTo: Partial<Client> | undefined
    onChange: (data: Partial<InvoiceFormData>) => void
    addLineItem?: () => void
    updateLineItem?: (index: number, data: Partial<LineItem>) => void
    removeLineItem?: (index: number) => void
    setIsNewClient?: (isNewClient: boolean) => void
    setNewClientData?: (newClientData: Partial<Client & { address: Partial<Address> }> | undefined) => void
    isNewClient?: boolean
    newClientData?: Partial<Client & { address: Partial<Address> }> | undefined
    handleAddClient?: () => Promise<void>
    handleCreateInvoice?: () => Promise<void>
    isCreating?: boolean
}

export function InvoiceForm({ formData, clients = [], onChange }: InvoiceFormProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showCustomDueDate, setShowCustomDueDate] = useState(false);
    const [isNewClient, setIsNewClient] = useState(false)
    const [newClientData, setNewClientData] = useState<Partial<Client & { address: Partial<Address> }> | undefined>({
        name: '',
        email: '',
        address: {
            street: '',
            city: '',
            country: '',
        }
    })

    // tRPC procedures
    const ctx = api.useUtils();
    const { mutateAsync: createInvoice } = api.invoicing.create.useMutation({
        onSuccess: () => {
            toast.success("Invoice created successfully")
            void ctx.invoicing.search.refetch();
        },
    });
    const { mutateAsync: addClient } = api.clients.create.useMutation({
        onSuccess: (newClient) => {
            toast.success("Client created successfully")
            void ctx.clients.search.refetch();
            formData.clientId = newClient.id;
            onChange({ clientId: newClient.id });
            setCurrentStep(step => step + 1);
        },
        onError: (error) => {
            toast.error((error as unknown as Error)?.message ?? "Failed to create client")
        }
    });

    const handleCreateInvoice = async () => {
        setIsCreating(true);
        console.log(formData.lineItems, formData)
        await createInvoice({
            clientId: formData.clientId?.toString() ?? "",
            invoiceNumber: formData.invoiceNumber,
            poNumber: formData.poNumber,
            currency: formData.currency as "USD" | "PHP",
            dueDate: formData.dueDate,
            notes: formData.notes,
            lineItems: formData.lineItems?.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: fromFormattedToNumber(item.unit_price),
                amount: fromFormattedToNumber(item.amount),
            })),
            status: "pending",
            subtotal: formData.lineItems?.reduce((sum, item) => sum + fromFormattedToNumber(item.amount), 0) ?? 0,
            taxRate: formData.taxRate,
            taxAmount: formData.lineItems?.reduce((sum, item) => sum + fromFormattedToNumber(item.amount), 0) * (formData.taxRate / 100),
            totalAmount: formData.lineItems?.reduce((sum, item) => sum + fromFormattedToNumber(item.amount), 0) + formData.lineItems?.reduce((sum, item) => sum + fromFormattedToNumber(item.amount), 0) * (formData.taxRate / 100),
        });
        setIsCreating(false);
    }

    const handleAddClient = async () => {
        await addClient({
            type: "company",
            name: newClientData?.name ?? "",
            email: newClientData?.email ?? "",
            street: newClientData?.address?.street ?? "",
            city: newClientData?.address?.city ?? "",
            country: newClientData?.address?.country ?? "",
            zipCode: newClientData?.address?.zip_code ?? "",

        })
    }

    const addLineItem = () => {
        const newLineItem: LineItem = {
            description: "",
            quantity: 1,
            unit_price: 0,
            amount: 0,
        }
        onChange({
            lineItems: [...formData.lineItems, newLineItem]
        })
    }

    const fromFormattedToNumber = (value: string | number) => {
        if (typeof value === 'string') {
            return Number(value.replace(/,/g, '').replace('$', ''));
        }
        return value;
    }

    const updateLineItem = (index: number, data: Partial<LineItem>) => {
        const newLineItems = [...formData.lineItems]
        const currentItem = newLineItems[index]!
        newLineItems[index] = {
            description: data.description ?? currentItem.description,
            quantity: data.quantity ?? currentItem.quantity,
            unit_price: data.unit_price ?? currentItem.unit_price,
            amount: (data.quantity ?? currentItem.quantity) * (fromFormattedToNumber(data.unit_price ?? 0) ?? fromFormattedToNumber(currentItem.unit_price))
        }
        onChange({ lineItems: newLineItems })
    }

    const removeLineItem = (index: number) => {
        onChange({
            lineItems: formData.lineItems.filter((_, i) => i !== index)
        })
    }

    const steps = [
        { id: 0, name: "Client Selection", component: ClientStep, props: { formData, clients, onChange, setIsNewClient, setNewClientData, isNewClient, newClientData, handleAddClient } },
        { id: 1, name: "Invoice Details", component: InvoiceDetailsStep, props: { formData, onChange, invoiceTo: clients.find((client) => client.id === formData.clientId) } },
        { id: 2, name: "Line Items", component: LineItemsStep, props: { formData, onChange, addLineItem, updateLineItem, removeLineItem } },
        {
            id: 3, name: "Payment Details", component: PaymentDetailsStep, props: {
                formData,
                onChange,
                showCustomDueDate,
                setShowCustomDueDate
            }
        },
        { id: 4, name: "Review", component: ReviewStep, props: { formData, onChange } },
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
                    setShowCustomDueDate,
                    setIsNewClient,
                    setNewClientData,
                    isNewClient,
                    newClientData,
                    handleAddClient,
                    handleCreateInvoice,
                    isCreating
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
                {currentStep !== steps.length - 1 && <Button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>}
            </div>
        </div>
    )
}

// Step Components
function ClientStep({ formData, clients, onChange, setIsNewClient, setNewClientData, isNewClient, newClientData, handleAddClient }: InvoiceFormProps) {
    const handleClientChange = (value: string) => {
        if (value === 'new') {
            setIsNewClient?.(true)
            onChange({ clientId: undefined })
        } else {
            setIsNewClient?.(false)
            onChange({ clientId: Number(value) })
        }
    }

    return (
        <div className="space-y-4">
            <Label>New invoice for</Label>
            <Select
                value={formData.clientId?.toString() ?? (isNewClient ? 'new' : '')}
                onValueChange={handleClientChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                    {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                        </SelectItem>
                    ))}
                    <SelectItem value="new" className="text-primary border-t">
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Client
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            {isNewClient && (
                <div className="space-y-4 mt-4 p-4 border rounded-lg">
                    <div>
                        <Label>Client Name</Label>
                        <Input
                            placeholder="Enter client name"
                            value={newClientData?.name}
                            onChange={(e) => {
                                const newClient = { ...newClientData, name: e.target.value }
                                setNewClientData?.(newClient as Client)
                            }}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            placeholder="client@example.com"
                            value={newClientData?.email ?? ''}
                            onChange={(e) => {
                                const newClient = { ...newClientData, email: e.target.value }
                                setNewClientData?.(newClient as Client)
                            }}
                        />
                    </div>
                    <div className="space-y-4">
                        <Label>Address Details</Label>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label className="text-sm text-gray-500">Street Address</Label>
                                <Input
                                    placeholder="Street address"
                                    value={newClientData?.address?.street ?? ''}
                                    onChange={(e) => {
                                        const newAddress = { ...newClientData?.address, street: e.target.value }
                                        const newClient = { ...newClientData, address: newAddress }
                                        setNewClientData?.(newClient as Client)
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-500">City</Label>
                                    <Input
                                        placeholder="City"
                                        value={newClientData?.address?.city}
                                        onChange={(e) => {
                                            const newAddress = { ...newClientData?.address, city: e.target.value }
                                            const newClient = { ...newClientData, address: newAddress }
                                            setNewClientData?.(newClient as Client)
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-500">State/Province</Label>
                                    <Input
                                        placeholder="State/Province"
                                        value={newClientData?.address?.state ?? ''}
                                        onChange={(e) => {
                                            const newAddress = { ...newClientData?.address, state: e.target.value }
                                            const newClient = { ...newClientData, address: newAddress }
                                            setNewClientData?.(newClient as Client)
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-500">Postal Code</Label>
                                    <Input
                                        placeholder="Postal code"
                                        value={newClientData?.address?.zip_code ?? ''}
                                        onChange={(e) => {
                                            const newAddress = { ...newClientData?.address, zip_code: e.target.value }
                                            const newClient = { ...newClientData, address: newAddress }
                                            setNewClientData?.(newClient as Client)
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-500">Country</Label>
                                    <Input
                                        placeholder="Country"
                                        value={newClientData?.address?.country}
                                        onChange={(e) => {
                                            const newAddress = { ...newClientData?.address, country: e.target.value }
                                            const newClient = { ...newClientData, address: newAddress }
                                            setNewClientData?.(newClient as Client)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsNewClient?.(false)
                                setNewClientData?.({
                                    id: undefined,
                                    name: '',
                                    email: '',
                                    address: {
                                        street: '',
                                        city: '',
                                        state: '',
                                        zip_code: '',
                                        country: ''
                                    }
                                })
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddClient}
                        >
                            Create Client
                        </Button>
                    </div>
                </div>
            )}
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
                        src={invoiceTo.email ?? invoiceTo.name ?? ''}
                        alt={invoiceTo.name ?? ''}
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
                                onChange={(e) => updateLineItem?.(index, { description: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-sm text-gray-500">Quantity</Label>
                            <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updateLineItem?.(index, { quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-3">
                            <Label className="text-sm text-gray-500">Unit Price
                                ({CURRENCIES[formData.currency]?.symbol})
                            </Label>
                            <Input
                                type="number"
                                placeholder="Price"
                                value={item.unit_price}
                                onChange={(e) => updateLineItem?.(index, { unit_price: e.target.value ? Number(e.target.value) : 0 })}
                            />
                        </div>

                        <div className="col-span-1">
                            <div className="mt-6">
                                <Button
                                    variant="ghost"
                                    className="text-red-700"
                                    onClick={() => removeLineItem?.(index)}
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

    const dueDateOptions = [
        { value: "today", label: "Today", subtext: "Due on receipt" },
        { value: "startOfMonth", label: "Start of Month", subtext: `Due on ${dayjs(formData.issueDate).add(1, 'month').startOf('month').format('MMMM D')}` },
        { value: "net30", label: calculateFutureDate(formData.issueDate, 30), subtext: "Net 30" },
        { value: "net60", label: calculateFutureDate(formData.issueDate, 60), subtext: "Net 60" },
        { value: "net90", label: calculateFutureDate(formData.issueDate, 90), subtext: "Net 90" },
        { value: "custom", label: "Custom...", subtext: "" },
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
                : new Date(Date.now() + parseInt(value.replace("net", "")) * 24 * 60 * 60 * 1000);

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
                                {dueDateOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col">
                                            <span>{option.label}</span>
                                            {option.subtext && (
                                                <span className="text-xs text-gray-500">{option.subtext}</span>
                                            )}
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
                    onValueChange={(value) => onChange({ repeatSchedule: value === 'none' ? null : value as 'weekly' | 'monthly' | 'yearly' })}
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

function ReviewStep({ formData, onChange, invoiceTo, handleCreateInvoice, isCreating }: InvoiceFormProps) {

    const getSchedulePreview = () => {
        if (!formData.repeatSchedule) return null;

        const date = formData.issueDate;
        if (!date) return null;

        const scheduleMap = {
            weekly: `Every ${date.toLocaleString('en-US', { weekday: 'long' })}`,
            monthly: `Monthly on the ${date.getDate()}${getDayOfMonthSuffix(date.getDate())}`,
            yearly: `Yearly on ${date.toLocaleString('en-US', { month: 'long' })} ${date.getDate()}`
        };

        return scheduleMap[formData.repeatSchedule];
    };

    const fromFormattedToNumber = (value: string | number) => {
        if (typeof value === 'string') {
            return Number(value.replace(/,/g, '').replace('$', ''));
        }
        return value;
    }

    const calculateTotal = () => {
        return formData.lineItems.reduce((sum, item) => sum + (fromFormattedToNumber(item.quantity) * fromFormattedToNumber(item.unit_price)), 0);
    };

    return (
        <div className="space-y-6">
            {/* Invoice Summary */}
            <div className="rounded-lg border p-6 space-y-4">
                <h3 className="font-semibold text-lg">Invoice Summary</h3>

                {invoiceTo && (
                    <div className="flex items-center gap-2 border-none p-2 rounded-lg bg-gray-100 justify-between">
                        <div className="flex items-center gap-2">
                            <BlurImage
                                src={invoiceTo.email ?? invoiceTo.name ?? ''}
                                alt={invoiceTo.name ?? ''}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <div className="flex flex-col">
                                <div className="font-medium">{invoiceTo.name}</div>
                                <div className="text-sm text-gray-500">{invoiceTo.email}</div>
                            </div>
                        </div>


                        <div className="text-right gap-2">
                            <Label className="text-gray-500">Total Amount</Label>
                            <p className="font-medium">${calculateTotal().toFixed(2)}</p>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <Label className="text-gray-700">Issue Date</Label>
                        <p className="text-sm text-gray-500">{dayjs(formData.issueDate).format('MMMM D, YYYY')}</p>
                    </div>
                    <div>
                        <Label className="text-gray-700 flex items-center gap-2">Due Date
                            <Badge variant="gray" className=" text-xs flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {dayjs(formData.dueDate).isSame(new Date(), 'day') ? "Today" : dayjs(formData.dueDate).fromNow()}
                            </Badge>
                        </Label>
                        <p className="text-sm text-gray-500">{dayjs(formData.dueDate).format('MMMM D, YYYY')}</p>
                    </div>
                </div>

                {/* Schedule Preview */}
                {getSchedulePreview() && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                            <ArrowsOppositeDirectionX className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Recurring Invoice</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            This invoice will repeat: {getSchedulePreview()}
                        </p>
                    </div>
                )}
            </div>

            {/* Email Options */}
            {/* <div className="rounded-lg border-none py-0 p-6 space-y-4">
                <div className="space-y-4">
                    <div>
                        <Label>CC Recipients (Optional)</Label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.ccEmail ?? ''}
                            onChange={(e) => onChange({ ccEmail: e.target.value })}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Separate multiple emails with commas
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">
                            The invoice will be sent to: <span className="font-medium">{invoiceTo?.email}</span>
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={() => {/* Handle create only */ }}
                >
                    Create
                </Button>
                {/* <Button
                    disabled={isCreating}
                    className={cn("group px-4 pr-8", isCreating && "opacity-50 py-3 px-6")}
                    onClick={() => handleCreateInvoice?.()}
                >
                    {isCreating ?
                        <LoadingDots className="h-4 w-4" color="white" />
                        : "Create and Send"}
                    <ExpandingArrow className="ml-1 h-4 w-4" />
                </Button> */}
            </div>
        </div>
    );
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
function calculateFutureDate(date: Date | null | undefined, days: number): string {
    const baseDate = date ?? new Date();
    const futureDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    return futureDate.toLocaleDateString('en-US', {
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
            return "net30";
        case 60:
            return "net60";
        case 90:
            return "net90";
        default:
            return "custom";
    }
} 