import { Address, BlockchainAccount, Client, FiatAccount, VerificationStatus } from "@prisma/client";
import { Recipient } from "./recipients-table";

export function recipientFormatter(client: Client & {
    address?: Address | null,
    fiat_accounts?: FiatAccount[] | null,
    blockchain_accounts?: BlockchainAccount[] | null
}): Recipient {
    return {
        id: client.id,
        isVerified: client.verification_status === VerificationStatus.VERIFIED,
        name: client.name,
        email: client.email ?? "",
        recipientType: client.recipient_type,
        bankingDetails: {
            id: "1",
            name: client.name,
            accountNumber: "1234567890",
            routingNumber: "1234567890",
            bankName: "Bank of America",
            bankAddress: "123 Main St",
            bankCity: "Anytown",
            bankState: "CA",
            bankZip: "12345",
            currency: {
                shortName: "USD",
                symbol: "$",
                name: "United States Dollar",
                flag: "🇺🇸",
            }
        }
    }
}   