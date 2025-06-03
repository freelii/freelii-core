import { BaseService } from '@/server/services/base-service';
import { OrchestratorService } from '@/server/services/orchestrator/orchestrator-service';
import { CURRENCIES } from '@freelii/utils';
import { fromUSD } from '@freelii/utils/functions';
import {
    BulkDisbursementStatus,
    BulkItemStatus,
    type BulkDisbursement,
    type BulkDisbursementItem,
    type Client,
    type PaymentDestination
} from '@prisma/client';

export interface CreateBulkDisbursementInput {
    recipients: Array<{
        recipientId: number;
        amountUsd: number; // Amount in USD (not cents)
    }>;
    reference?: string;
}

export interface BulkDisbursementWithItems extends BulkDisbursement {
    items: Array<BulkDisbursementItem & {
        recipient: Client & {
            payment_destinations: Array<PaymentDestination>;
        };
    }>;
}

export class BulkDisbursementService extends BaseService {
    private orchestratorService: OrchestratorService;

    constructor(options: { db: any; session: any }) {
        super(options);
        this.orchestratorService = new OrchestratorService(options);
    }

    /**
     * Create a new bulk disbursement
     */
    async createBulkDisbursement(input: CreateBulkDisbursementInput): Promise<BulkDisbursementWithItems> {
        const senderId = parseInt(this.session.user.id);

        // Calculate total amount in USD cents
        const totalAmountUsd = input.recipients.reduce((sum, recipient) => sum + recipient.amountUsd, 0);
        const totalAmountCents = Math.round(totalAmountUsd * 100);

        // Get user's default wallet
        const wallet = await this.db.wallet.findFirst({
            where: {
                user_id: senderId,
                is_default: true
            },
            include: {
                main_balance: true
            }
        });

        if (!wallet) {
            throw new Error('No default wallet found');
        }

        // Create bulk disbursement record
        const bulkDisbursement = await this.db.bulkDisbursement.create({
            data: {
                sender_id: senderId,
                total_amount_usd: totalAmountCents,
                total_recipients: input.recipients.length,
                reference: input.reference,
                status: BulkDisbursementStatus.PENDING
            }
        });

        // Create individual disbursement items
        const items = [];
        for (const recipientData of input.recipients) {
            // Get recipient with payment destinations
            const recipient = await this.db.client.findUniqueOrThrow({
                where: { id: recipientData.recipientId },
                include: {
                    payment_destinations: {
                        where: { is_default: true },
                        include: {
                            fiat_account: true,
                            blockchain_account: true,
                            ewallet_account: true
                        }
                    },
                    address: true
                }
            });

            if (recipient.payment_destinations.length === 0) {
                throw new Error(`Recipient ${recipient.name} has no payment destinations`);
            }

            const paymentDestination = recipient.payment_destinations[0];
            const targetCurrency = this.getRecipientCurrency(recipient);

            // Convert USD to target currency
            const targetAmount = fromUSD(recipientData.amountUsd, targetCurrency);
            const targetAmountCents = Math.round(targetAmount * 100);

            // Get exchange rate for tracking
            const exchangeRate = targetCurrency === 'USD' ? 1 : (CURRENCIES[targetCurrency]?.rate || 1);

            const item = await this.db.bulkDisbursementItem.create({
                data: {
                    bulk_disbursement_id: bulkDisbursement.id,
                    recipient_id: recipientData.recipientId,
                    amount_usd: Math.round(recipientData.amountUsd * 100), // Convert to cents
                    target_currency: targetCurrency,
                    target_amount: targetAmountCents,
                    exchange_rate: exchangeRate,
                    status: BulkItemStatus.PENDING
                },
                include: {
                    recipient: {
                        include: {
                            payment_destinations: true
                        }
                    }
                }
            });

            items.push(item);
        }

        return {
            ...bulkDisbursement,
            items
        };
    }

    /**
     * Process a bulk disbursement by creating individual payment orchestrations
     */
    async processBulkDisbursement(bulkDisbursementId: string): Promise<void> {
        const bulkDisbursement = await this.db.bulkDisbursement.findUniqueOrThrow({
            where: { id: bulkDisbursementId },
            include: {
                items: {
                    include: {
                        recipient: {
                            include: {
                                payment_destinations: {
                                    where: { is_default: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Update bulk disbursement status to processing
        await this.db.bulkDisbursement.update({
            where: { id: bulkDisbursementId },
            data: {
                status: BulkDisbursementStatus.PROCESSING,
                initiated_at: new Date()
            }
        });

        // Get user's default wallet
        const wallet = await this.db.wallet.findFirst({
            where: {
                user_id: bulkDisbursement.sender_id,
                is_default: true
            }
        });

        if (!wallet) {
            throw new Error('No default wallet found');
        }

        // Process each item
        for (const item of bulkDisbursement.items) {
            try {
                // Update item status to processing
                await this.db.bulkDisbursementItem.update({
                    where: { id: item.id },
                    data: { status: BulkItemStatus.PROCESSING }
                });

                const paymentDestination = item.recipient.payment_destinations[0];
                if (!paymentDestination) {
                    throw new Error(`No payment destination found for recipient ${item.recipient.name}`);
                }

                // Initiate payment through orchestrator
                const result = await this.orchestratorService.initiatePayment({
                    sourceAmount: (item.amount_usd / 100).toString(), // Convert back to dollars
                    senderId: bulkDisbursement.sender_id,
                    walletId: wallet.id,
                    recipientId: item.recipient_id,
                    destinationId: paymentDestination.id
                });

                if (result.success && result.state) {
                    // Link the payment orchestration to the bulk disbursement item
                    await this.db.bulkDisbursementItem.update({
                        where: { id: item.id },
                        data: {
                            payment_orchestration_id: result.state.id,
                            processed_at: new Date()
                        }
                    });
                } else {
                    // Mark item as failed
                    await this.db.bulkDisbursementItem.update({
                        where: { id: item.id },
                        data: {
                            status: BulkItemStatus.FAILED,
                            failed_at: new Date(),
                            failed_reason: result.error || 'Unknown error'
                        }
                    });
                }
            } catch (error) {
                // Mark item as failed
                await this.db.bulkDisbursementItem.update({
                    where: { id: item.id },
                    data: {
                        status: BulkItemStatus.FAILED,
                        failed_at: new Date(),
                        failed_reason: error instanceof Error ? error.message : 'Unknown error'
                    }
                });
            }
        }

        // Update bulk disbursement status based on item results
        await this.updateBulkDisbursementStatus(bulkDisbursementId);
    }

    /**
     * Get bulk disbursements for a user
     */
    async getBulkDisbursements(limit: number = 10, offset: number = 0): Promise<BulkDisbursementWithItems[]> {
        const senderId = parseInt(this.session.user.id);

        return this.db.bulkDisbursement.findMany({
            where: { sender_id: senderId },
            include: {
                items: {
                    include: {
                        recipient: {
                            include: {
                                payment_destinations: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    }

    /**
     * Get a specific bulk disbursement
     */
    async getBulkDisbursement(id: string): Promise<BulkDisbursementWithItems | null> {
        const senderId = parseInt(this.session.user.id);

        return this.db.bulkDisbursement.findFirst({
            where: {
                id,
                sender_id: senderId
            },
            include: {
                items: {
                    include: {
                        recipient: {
                            include: {
                                payment_destinations: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Update bulk disbursement status based on item statuses
     */
    private async updateBulkDisbursementStatus(bulkDisbursementId: string): Promise<void> {
        const items = await this.db.bulkDisbursementItem.findMany({
            where: { bulk_disbursement_id: bulkDisbursementId }
        });

        const completedItems = items.filter(item => item.status === BulkItemStatus.COMPLETED);
        const failedItems = items.filter(item => item.status === BulkItemStatus.FAILED);
        const processingItems = items.filter(item => item.status === BulkItemStatus.PROCESSING);

        let status: BulkDisbursementStatus;
        let completedAt: Date | null = null;
        let failedAt: Date | null = null;
        let failedReason: string | null = null;

        if (completedItems.length === items.length) {
            status = BulkDisbursementStatus.COMPLETED;
            completedAt = new Date();
        } else if (failedItems.length === items.length) {
            status = BulkDisbursementStatus.FAILED;
            failedAt = new Date();
            failedReason = 'All items failed';
        } else if (processingItems.length === 0) {
            // Some completed, some failed
            status = BulkDisbursementStatus.PARTIALLY_COMPLETED;
            completedAt = new Date();
        } else {
            status = BulkDisbursementStatus.PROCESSING;
        }

        await this.db.bulkDisbursement.update({
            where: { id: bulkDisbursementId },
            data: {
                status,
                completed_at: completedAt,
                failed_at: failedAt,
                failed_reason: failedReason
            }
        });
    }

    /**
     * Get recipient currency based on their payment destination and address
     */
    private getRecipientCurrency(recipient: any): string {
        // Get currency from payment destinations
        const paymentDestination = recipient.payment_destinations?.[0];
        if (paymentDestination?.fiat_account) {
            // Determine currency based on country or bank
            const address = recipient.address;
            if (address?.country === "Philippines") return "PHP";
            if (address?.country === "Mexico") return "MXN";
            if (address?.country === "Canada") return "CAD";
            if (address?.country === "United Kingdom") return "GBP";
            if (address?.country === "European Union") return "EUR";
            if (address?.country === "Hong Kong") return "HKD";
            if (address?.country === "Singapore") return "SGD";
        }
        return "USD"; // Default to USD
    }
} 