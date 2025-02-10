interface FiatDetailsProps {
    country: 'Mexico' | 'United States' | 'Philippines';
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string;
    transferMethod?: 'instapay' | 'pesonet';
}

export function FiatDetails({ formData }: { formData: FiatDetailsProps }) {
    if (!formData) return <div>No form data</div>;

    if (formData.country === "Mexico") {
        return (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                    <label className="block text-xs font-medium text-gray-500">Account Holder</label>
                    <p className="text-xs mt-1">{formData.accountHolderName}</p>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">CLABE</label>
                    <p className="text-xs mt-1">{formData.accountNumber}a</p>
                </div>
            </div>
        )
    }
    if (formData.country === "United States") {
        return (
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
                {/* {formData.purposeOfPayment && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Purpose of Payment</label>
                        <p className="text-xs mt-1">{formData.purposeOfPayment}</p>
                    </div>
                )} */}
            </div>
        )
    }
    if (formData.country === "Philippines") {
        return (
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
                    <label className="block text-xs font-medium text-gray-500">Account Number</label>
                    <p className="text-xs mt-1">****{formData.accountNumber.slice(-4)}</p>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Transfer Method</label>
                    <p className="text-xs mt-1 capitalize">{formData.transferMethod}</p>
                </div>
            </div>
        )
    }
    return <div>No form data</div>;
}