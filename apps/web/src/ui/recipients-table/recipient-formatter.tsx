import { Address, BlockchainAccount, Client, FiatAccount } from "@prisma/client";
import { Recipient } from "./recipients-table";

export function recipientFormatter(client: Client & {
    address?: Address | null,
    fiat_accounts?: FiatAccount[],
    blockchain_accounts?: BlockchainAccount[]
}): Recipient {
    return {
        ...client,
        address: client.address,
        fiat_accounts: client.fiat_accounts,
        blockchain_accounts: client.blockchain_accounts
    };
}   