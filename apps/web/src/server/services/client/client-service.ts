import { EwalletProvider, FiatAccountType, Prisma, RecipientType, TransferMethod } from "@prisma/client";
import { z } from "zod";
import { BaseService } from "../base-service";
import { ClientCreateSchema } from "./schemas/client-create.schema";
import { ClientGetSchema } from "./schemas/client-get.schema";
import { ClientSearchSchema } from "./schemas/client-search.schema";

export class ClientService extends BaseService {
    /**
     * Search for clients
     * @param input - The input data for searching clients
     * @returns The clients found
     */
    async searchClients(input: z.infer<typeof ClientSearchSchema>) {
        const { query, page = 1, limit = 10 } = input;
        const skip = (page - 1) * limit;
        const where: Prisma.ClientWhereInput = {
            user_id: Number(this.session.user.id),
            is_archived: false,
        };
        if (query) {
            where.name = {
                contains: query,
                mode: "insensitive",
            };
        }
        return await this.db.client.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                created_at: "desc",
            }, include: {
                address: true,
                fiat_accounts: true,
                blockchain_accounts: true,
                ewallet_accounts: true,
            }
        });
    }

    /**
         * Create a new client
         * @param input - The input data for creating a client
         * @returns The created client
         */
    async createClient(input: z.infer<typeof ClientCreateSchema>) {
        const { name, email, tax_number, street, city, state, country, zipCode, paymentMethod, bankName, accountNumber, routingNumber, accountType, accountHolderName, walletAddress, network, ewalletProvider, mobileNumber, transferMethod } = input;

        return this.db.$transaction(async (tx) => {
            const client = await tx.client.create({
                data: {
                    user_id: Number(this.session.user.id),
                    name,
                    email,
                    tax_number,
                    verification_status: "VERIFIED",
                    recipient_type: input.type === "company"
                        ? RecipientType.BUSINESS
                        : RecipientType.INDIVIDUAL,
                },
            });
            // Address
            if (street && city && country) {
                const address = await tx.address.create({
                    data: {
                        client_id: client.id,
                        street,
                        city,
                        country,
                        zip_code: zipCode,
                    },
                });
            }

            // Fiat Account
            if (paymentMethod === "fiat") {
                if (
                    !bankName ||
                    !accountNumber ||
                    !routingNumber ||
                    !accountType ||
                    !accountHolderName
                ) {
                    throw new Error("Missing required fields");
                }
                const fiatAccount = await tx.fiatAccount.create({
                    data: {
                        client_id: client.id,
                        alias: bankName,
                        account_number: accountNumber,
                        routing_number: routingNumber,
                        account_type: accountType === "checking" ? FiatAccountType.CHECKING : FiatAccountType.SAVINGS,
                        account_holder_name: accountHolderName,
                        bank_name: bankName,
                        bank_address: street ?? "",
                        bank_city: city ?? "",
                        bank_state: state ?? "",
                        bank_zip: zipCode ?? "",
                        iso_currency: "USD",
                        transfer_method: transferMethod === "instapay" ? TransferMethod.PH_INSTAPAY : transferMethod === "pesonet" ? TransferMethod.PH_PESONET : undefined,
                    },
                });
                console.log('Fiat account created', fiatAccount);
            } else if (paymentMethod === "blockchain") {
                if (!walletAddress || !network) {
                    throw new Error("Missing required fields");
                }
                const blockchainAccount = await tx.blockchainAccount.create({
                    data: {
                        client_id: client.id,
                        address: walletAddress,
                        network: network,
                        environment: "testnet",
                    },
                });
                console.log('Blockchain account created', blockchainAccount);
            } else if (paymentMethod === "ewallet") {
                if (!ewalletProvider || !mobileNumber) {
                    throw new Error("Missing required fields");
                }
                const ewalletAccount = await tx.ewalletAccount.create({
                    data: {
                        client_id: client.id,
                        mobile_number: mobileNumber,
                        ewallet_provider: ewalletProvider === "gcash" ? EwalletProvider.PH_GCASH : ewalletProvider === "maya" ? EwalletProvider.PH_MAYA : ewalletProvider === "coins_ph" ? EwalletProvider.PH_COINS_PH : undefined,
                        iso_currency: "PHP",
                    },
                });
                console.log('Ewallet account created', ewalletAccount);
            }
            return client;
        });
    }

    async getClient(input: z.infer<typeof ClientGetSchema>) {
        const { id } = input;
        const client = await this.db.client.findUnique({
            where: { id, is_archived: false },
            include: {
                address: true,
                fiat_accounts: true,
                blockchain_accounts: true,
                ewallet_accounts: true,
            }
        });
        if (client?.user_id !== Number(this.session.user.id)) {
            throw new Error("Unauthorized");
        }
        return client;
    }

    async archiveClient(input: z.infer<typeof ClientGetSchema>) {
        const { id } = input;
        await this.db.client.update({
            where: { id, is_archived: false },
            data: {
                is_archived: true,
            }
        });
    }

}
