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
            <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Account Holder</label>
                        <p className="mt-1 text-[15px] text-gray-900">{formData.accountHolderName}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">CLABE</label>
                        <p className="mt-1 text-[15px] font-mono text-gray-900">{formData.accountNumber}</p>
                    </div>
                </div>
            </div>
        )
    }
    if (formData.country === "United States") {
        return (
            <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Account Holder</label>
                        <p className="mt-1 text-[15px] text-gray-900">{formData.accountHolderName}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Bank</label>
                        <p className="mt-1 text-[15px] text-gray-900">{formData.bankName}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Account Type</label>
                        <p className="mt-1 text-[15px] text-gray-900 capitalize">{formData.accountType}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Account Number</label>
                        <p className="mt-1 text-[15px] font-mono text-gray-900">••••{formData.accountNumber.slice(-4)}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Routing Number</label>
                        <p className="mt-1 text-[15px] font-mono text-gray-900">••••{formData.routingNumber.slice(-4)}</p>
                    </div>
                </div>
            </div>
        )
    }
    if (formData.country === "Philippines") {
        return (
            <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Account Holder</label>
                        <p className="mt-1 text-[15px] text-gray-900">{formData.accountHolderName}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Bank</label>
                        <p className="mt-1 text-[15px] text-gray-900">{formData.bankName}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Account Number</label>
                        <p className="mt-1 text-[15px] font-mono text-gray-900">••••{formData.accountNumber.slice(-4)}</p>
                    </div>
                    <div className="px-6 py-4">
                        <label className="block text-[13px] font-medium text-gray-700">Transfer Method</label>
                        <p className="mt-1 text-[15px] text-gray-900 capitalize">
                            {formData.transferMethod === "instapay" ? "InstaPay" : "PESONet"}
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    return <div className="text-[15px] text-gray-500">No payment details available</div>;
}