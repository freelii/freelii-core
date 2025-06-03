import { Badge } from "@freelii/ui";
import { shortAddress } from "@freelii/utils/functions";
import { type BlockchainAccount, type EwalletAccount, type FiatAccount, type PaymentDestination } from "@prisma/client";



export function AccountDetails({ selectedAccount }: { selectedAccount?: PaymentDestination & { ewallet_account?: EwalletAccount | null, blockchain_account?: BlockchainAccount | null, fiat_account?: FiatAccount | null } | null }) {
    const NoAccount = () => {

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
    if (!selectedAccount) {
        return <NoAccount />
    }
    const { ewallet_account, blockchain_account, fiat_account } = selectedAccount ?? {};

    if (blockchain_account) {
        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="font-medium">{(blockchain_account).network}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Address</span>
                    <span className="font-medium">
                        {shortAddress((blockchain_account).address)}
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

    if (ewallet_account) {
        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">E-wallet</span>
                    <span className="font-medium">{(ewallet_account).ewallet_provider?.replace("PH_", " ")}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Mobile Number</span>
                    <span className="font-medium">
                        {(ewallet_account).mobile_number}
                    </span>
                </div>
            </div>
        )
    }

    if (fiat_account) {
        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-medium">{(fiat_account).bank_name}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Account</span>
                    <span className="font-medium">
                        {(fiat_account).account_number}
                    </span>
                </div>
            </div>
        )
    }

    return <NoAccount />;
}