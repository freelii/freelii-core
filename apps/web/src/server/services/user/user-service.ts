import { type BlockchainAccount, type EwalletAccount, EwalletProvider, type FiatAccount, FiatAccountType, TransferMethod, type User } from "@prisma/client";
import { BaseService } from "../base-service";
import { type LinkWithdrawalAccountInput } from "./schemas/link-withdrawal-account.schema";

export class UserService extends BaseService {
    /**
     * Link a withdrawal account to a user
     * @param input
     */
    async linkWithdrawalAccount(input: LinkWithdrawalAccountInput) {
        const user = await this.db.user.findUniqueOrThrow({
            where: { id: Number(this.session.user.id) },
        });
        const { paymentMethod, currency, bankName, accountNumber, routingNumber, accountType, accountHolderName, transferMethod, walletAddress, network, ewalletProvider, mobileNumber } = input;
        if (paymentMethod === "fiat") {
            if (
                !accountNumber
            ) {
                throw new Error("Missing required fields for fiat account");
            }
            const fiatAccount = await this.db.fiatAccount.create({
                data: {
                    user_id: user.id,
                    alias: bankName ?? "",
                    account_number: accountNumber,
                    routing_number: routingNumber ?? "",
                    account_type: accountType === "checking" ? FiatAccountType.CHECKING : FiatAccountType.SAVINGS,
                    account_holder_name: accountHolderName ?? "",
                    bank_name: bankName ?? "",
                    iso_currency: currency ?? "USD",
                    transfer_method: transferMethod === "instapay" ? TransferMethod.PH_INSTAPAY : transferMethod === "pesonet" ? TransferMethod.PH_PESONET : undefined,
                },
            });
        } else if (paymentMethod === "blockchain") {
            if (!walletAddress) {
                throw new Error(`1 Missing required fields for blockchain account ${walletAddress} ${network}`);
            }
            const blockchainAccount = await this.db.blockchainAccount.create({
                data: {
                    user_id: user.id,
                    address: walletAddress,
                    network: network ?? "stellar",
                    environment: "testnet",
                },
            });
            console.log('Blockchain account created', blockchainAccount);
        } else if (paymentMethod === "ewallet") {
            if (!ewalletProvider || !mobileNumber) {
                throw new Error("Missing required fields for ewallet account");
            }
            const ewalletAccount = await this.db.ewalletAccount.create({
                data: {
                    user_id: user.id,
                    mobile_number: mobileNumber,
                    ewallet_provider: ewalletProvider === "gcash" ? EwalletProvider.PH_GCASH : ewalletProvider === "maya" ? EwalletProvider.PH_MAYA : ewalletProvider === "coins_ph" ? EwalletProvider.PH_COINS_PH : undefined,
                    iso_currency: "PHP",
                },
            });
            console.log('Ewallet account created', ewalletAccount);
        }
    }

    /** 
     * List withdrawal accounts for a user
     */
    async listWithdrawalAccounts(): Promise<User & {
        fiat_accounts: FiatAccount[];
        blockchain_accounts: BlockchainAccount[];
        ewallet_accounts: EwalletAccount[];
    }> {
        const user = await this.db.user.findUniqueOrThrow({
            where: { id: Number(this.session.user.id) },
            include: {
                fiat_accounts: true,
                blockchain_accounts: true,
                ewallet_accounts: true,
            },
        });
        return user;
    }
}