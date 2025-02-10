import { Badge } from "@freelii/ui"
import { shortAddress } from "@freelii/utils/functions"
import { BlockchainAccount, EwalletAccount, FiatAccount } from "@prisma/client"



export function AccountDetails({ selectedAccount }: { selectedAccount: BlockchainAccount | FiatAccount | EwalletAccount | null }) {
    const isFromStellar = (selectedAccount as BlockchainAccount)?.network === 'stellar'
    const isFromEwallet = !!(selectedAccount as EwalletAccount)?.ewallet_provider
    if (!selectedAccount) {
        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Account</span>
                    <span className="font-medium">
                        No account selected
                    </span>
                </div>
            </div>)
    }

    if (isFromStellar) {
        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="font-medium">{(selectedAccount as BlockchainAccount)?.network}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Address</span>
                    <span className="font-medium">
                        {shortAddress((selectedAccount as BlockchainAccount)?.address)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Settlement</span>
                    <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                        Instant
                    </Badge>
                </div>
            </div>
        )
    }

    if (isFromEwallet) {
        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">E-wallet</span>
                    <span className="font-medium">{(selectedAccount as EwalletAccount)?.ewallet_provider?.replace("PH_", " ")}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Mobile Number</span>
                    <span className="font-medium">
                        {(selectedAccount as EwalletAccount)?.mobile_number}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-gray-500">Bank</span>
                <span className="font-medium">{(selectedAccount as FiatAccount)?.bank_name}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-500">Account</span>
                <span className="font-medium">
                    {(selectedAccount as FiatAccount)?.account_number}
                </span>
            </div>
        </div>
    )

}