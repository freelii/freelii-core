import { Address, BlockchainAccount, Client, EwalletAccount, FiatAccount } from "@prisma/client";
import { Recipient } from "./recipients-table";

export function recipientFormatter(client: Client & {
    address?: Address | null,
    fiat_accounts?: FiatAccount[],
    blockchain_accounts?: BlockchainAccount[],
    ewallet_accounts?: EwalletAccount[]
}): Recipient {
    return {
        ...client,
        address: client.address,
        fiat_accounts: client.fiat_accounts,
        blockchain_accounts: client.blockchain_accounts,
        ewallet_accounts: client.ewallet_accounts
    };
}   