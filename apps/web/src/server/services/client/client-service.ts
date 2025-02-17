import { Prisma, RecipientType } from "@prisma/client";
import { z } from "zod";
import { BaseService } from "../base-service";
import { PaymentAccountService } from "../payment-account/payment-account-service";
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
            },
            include: {
                address: true,
                payment_destinations: {
                    include: {
                        fiat_account: true,
                        blockchain_account: true,
                        ewallet_account: true,
                    }
                },
            }
        });
    }

    /**
         * Create a new client
         * @param input - The input data for creating a client
         * @returns The created client
         */
    async createClient(input: z.infer<typeof ClientCreateSchema>) {
        const { name, email, tax_number, street, city, state, country, zipCode, paymentAccount } = input;


        const client = await this.db.client.create({
            data: {
                user_id: Number(this.session.user.id),
                name,
                email,
                tax_number,
                verification_status: "PENDING",
                recipient_type: input.type === "company"
                    ? RecipientType.BUSINESS
                    : RecipientType.INDIVIDUAL,
            },
        });

        // Address
        if (street && city && country) {
            await this.db.address.create({
                data: {
                    client_id: client.id,
                    street,
                    city,
                    country,
                    zip_code: zipCode,
                },
            });
        }

        // Early return if no payment account is provided
        if (!paymentAccount) {
            return client;
        }

        const paymentAccountService = new PaymentAccountService({
            db: this.db,
            session: this.session,
        });

        if (!paymentAccount.accountHolderName) {
            paymentAccount.accountHolderName = name;
        }

        await paymentAccountService.createPaymentAccount(paymentAccount, client.id);
        return client;
    }

    async getClient(input: z.infer<typeof ClientGetSchema>) {
        const { id } = input;
        const client = await this.db.client.findUnique({
            where: { id, is_archived: false },
            include: {
                address: true,
                payment_destinations: {
                    include: {
                        fiat_account: true,
                        blockchain_account: true,
                        ewallet_account: true,
                    }
                },
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

    async archiveMany(input: Array<number>) {
        await this.db.client.updateMany({
            where: { id: { in: input }, is_archived: false },
            data: { is_archived: true },
        });
    }

}
