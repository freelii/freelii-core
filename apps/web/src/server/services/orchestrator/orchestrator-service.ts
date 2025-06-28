import {
    AnchorService,
    PaymentRail,
    type GetQuoteParams
} from '@freelii/anchors';
import {
    PaymentOrchestrationStatus,
    TransactionStatus,
    type BlockchainAccount,
    type Client,
    type EwalletAccount,
    type FiatAccount,
    type PaymentDestination,
    type PaymentOrchestrationState,
    type PrismaClient
} from '@prisma/client';
import { BaseService } from '@services/base-service';
import type {
    PaymentOrchestrationConfig,
    PaymentOrchestrationResult,
    WebhookEvent
} from './orchestrator.interfaces';

interface BaseServiceOptions {
    db: PrismaClient;
    session?: {
        user: {
            id: string;
        }
    }
}

type PaymentOrchestrationStateWithRelations = PaymentOrchestrationState & {
    recipient: Client;
    destination: PaymentDestination & {
        fiat_account: FiatAccount | null;
        blockchain_account: BlockchainAccount | null;
        ewallet_account: EwalletAccount | null;
    } | null;
}

export class OrchestratorService extends BaseService {
    private readonly anchorService: AnchorService;

    constructor(options: BaseServiceOptions) {
        super(options);
        this.anchorService = new AnchorService();
    }

    /**
     * Get a quote for a given source and target currency, through the best anchor
     */
    async getRate({ sourceCurrency, targetCurrency, ...amountConfig }: GetQuoteParams) {
        let amount: number | undefined;
        if ('sourceAmount' in amountConfig) {
            amount = Number(amountConfig.sourceAmount);
        } else if ('targetAmount' in amountConfig) {
            amount = Number(amountConfig.targetAmount);
        }
        if (!amount) {
            throw new Error('Amount is required');
        }
        const result = await this.anchorService.getOptimalAnchor(
            amount,
            sourceCurrency,
            targetCurrency,
            PaymentRail.CRYPTO
        );

        return result;
    }

    getExpectedTargetAmount(sourceAmount: number, exchangeRate: number): number {
        return (sourceAmount * exchangeRate);
    }

    /**
     * Initiates a new payment, locks the amount in the source currency
     * and this it what the User needs to confirm.
     * Consider expiration of the quote.
     */
    async initiatePayment(config: PaymentOrchestrationConfig): Promise<PaymentOrchestrationResult> {
        try {
            const source = await this.db.wallet.findUniqueOrThrow({
                where: { id: config.walletId },
                include: {
                    main_balance: true
                }
            });
            const destination = await this.db.paymentDestination.findUniqueOrThrow({
                where: { id: config.destinationId },
                include: {
                    fiat_account: true,
                    blockchain_account: true,
                    ewallet_account: true
                }
            });
            console.log('destination', destination)
            console.log('source', source)

            if (!source.main_balance) {
                throw new Error('Source wallet has no main balance');
            }

            const sourceCurrency = source.main_balance.currency;
            const targetCurrency = destination.currency;
            const sourceAmount = parseInt(config.sourceAmount, 10);

            // Get optimal anchor and rate
            const { anchor, rate } = await this.anchorService.getOptimalAnchor(
                sourceAmount,
                sourceCurrency,
                targetCurrency,
                PaymentRail.CRYPTO
            );
            console.log('anchor', anchor)
            console.log('rate', rate)

            const targetAmount = this.getExpectedTargetAmount(sourceAmount, rate.exchangeRate);

            // Create payment state record
            const state = await this.db.paymentOrchestrationState.create({
                data: {
                    status: PaymentOrchestrationStatus.NOT_STARTED,
                    source_currency: sourceCurrency,
                    target_currency: targetCurrency,
                    source_amount: sourceAmount * 100,
                    target_amount: targetAmount * 100,
                    exchange_rate: rate.exchangeRate * 100,
                    anchor: anchor.name,
                    recipient_id: config.recipientId,
                    sender_id: config.senderId,
                    wallet_id: config.walletId,
                    destination_id: config.destinationId,
                }
            });

            return {
                success: true,
                state
            };
        } catch (error) {
            console.error('Failed to initiate payment:', error);
            return {
                success: false,
                state: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async getPaymentInstructions(stateId: string) {
        const state = await this.db.paymentOrchestrationState.findUniqueOrThrow({
            where: { id: stateId },
            include: {
                destination: {
                    include: {
                        blockchain_account: true,
                        ewallet_account: true,
                        fiat_account: true
                    }
                }
            }
        });
        const anchor = this.anchorService.getAnchor(state.anchor);
        const walletAddress = await anchor.getLiquidationAddress(state.destination);
        return {
            amount: state.source_amount,
            walletAddress
        }
    }
    /**
     * Process a blockchain transaction confirmation 
     * (Funds sent by the User to the liquidation address)
     */
    async processBlockchainConfirmation(
        paymentId: string,
        txId: string,
        txHash: string
    ): Promise<PaymentOrchestrationResult> {
        try {
            const state = await this.db.paymentOrchestrationState.update({
                where: { id: paymentId },
                data: {
                    tx_id: txId,
                    tx_hash: txHash,
                    status: TransactionStatus.PENDING,
                    sent_at: new Date()
                }
            });

            return {
                success: true,
                state
            };
        } catch (error) {
            console.error('Failed to process blockchain confirmation:', error);
            return {
                success: false,
                state: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process a webhook event
     */
    async processWebhook(event: WebhookEvent): Promise<PaymentOrchestrationResult> {
        try {
            const { paymentId, status, failedReason } = event.data;

            const state = await this.db.paymentOrchestrationState.update({
                where: { id: paymentId },
                data: {
                    status,
                    ...(status === TransactionStatus.COMPLETED ? { completed_at: new Date() } : {}),
                    ...(status === TransactionStatus.FAILED ? {
                        failed_at: new Date(),
                        failed_reason: failedReason
                    } : {})
                }
            });

            return {
                success: true,
                state
            };
        } catch (error) {
            console.error('Failed to process webhook:', error);
            return {
                success: false,
                state: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get the current state of a payment
     */
    async getPaymentState(paymentId: string): Promise<PaymentOrchestrationStateWithRelations | null> {
        console.log('getPaymentState', paymentId, this.session.user.id)
        const state = await this.db.paymentOrchestrationState.findUnique({
            where: {
                id: paymentId,
                sender_id: Number(this.session.user.id)
            },
            include: {
                recipient: true,
                destination: {
                    include: {
                        fiat_account: true,
                        blockchain_account: true,
                        ewallet_account: true
                    }
                }
            }
        });
        console.log('getPaymentState state', this.session.user.id, state)
        return state ?? null;
    }


    async processPaymentSettled(paymentId: string) {
        try {
            const state = await this.db.paymentOrchestrationState.findUniqueOrThrow({
                where: { id: paymentId },
                include: {
                    recipient: true,
                    destination: {
                        include: {
                            fiat_account: true,
                            blockchain_account: true,
                            ewallet_account: true
                        }
                    }
                }
            });

            console.log('state', state)

            const anchor = this.anchorService.getAnchor(state.anchor);
            console.log('anchor', anchor)
            // Convert from source currency to target currency
            const numberDifference = await anchor.convertCurrency(
                state.source_currency,
                state.target_currency,
                state.source_amount / 100,
                state.target_amount / 100,
            );
            console.log('numberDifference', numberDifference)
            const { recipient, destination } = state;
            let accountHolderName = recipient.name;
            let accountNumber = ''
            let bankName = ''
            let mobileNumber = ''
            let ewalletProvider = ''
            let walletAddress = ''

            if (!destination) {
                throw new Error('Destination not found');
            }

            if (destination.fiat_account) {
                accountHolderName = destination.fiat_account.account_holder_name ?? recipient.name;
                accountNumber = destination.fiat_account.account_number;
                bankName = destination.fiat_account.bank_name ?? '';
            } else if (destination.blockchain_account) {
                walletAddress = destination.blockchain_account.address;
            } else if (destination.ewallet_account) {
                ewalletProvider = destination.ewallet_account.ewallet_provider ?? '';
                mobileNumber = destination.ewallet_account.mobile_number ?? '';
                accountNumber = destination.ewallet_account.account_number ?? '';
            }

            console.log('accountHolderName', accountHolderName)
            console.log('accountNumber', accountNumber)
            console.log('bankName', bankName)
            console.log('mobileNumber', mobileNumber)
            console.log('ewalletProvider', ewalletProvider)
            console.log('walletAddress', walletAddress)


            // Trigger Cash-Out
            await anchor.requestCashout({
                targetAmount: state.target_amount / 100,
                sourceCurrency: state.source_currency,
                targetCurrency: state.target_currency,
                recipientDetails: {
                    name: accountHolderName,
                    accountNumber,
                    bankName,
                    ewalletProvider,
                    mobileNumber
                }
            });

            await this.db.paymentOrchestrationState.update({
                where: { id: paymentId },
                data: {
                    sent_to_recipient_at: new Date(),
                    status: PaymentOrchestrationStatus.SENT_TO_RECIPIENT,
                }
            });

        } catch (error) {
            console.error('Failed to process payment settled:', error);
            return {
                success: false,
                state: null as unknown as PaymentOrchestrationState,
            };
        }
    }
}