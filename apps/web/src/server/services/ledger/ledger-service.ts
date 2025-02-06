import { TransactionMovementType, Transactions, TransactionStatus, TransactionType } from "@prisma/client";
import { BaseService, BaseServiceOptions } from "../base-service";

interface LedgerServiceOptions extends BaseServiceOptions {
    walletId: string;
}

export class LedgerService extends BaseService {
    readonly walletId: string;


    constructor(options: LedgerServiceOptions) {
        const { walletId, ...baseOptions } = options;
        super(baseOptions);
        this.walletId = walletId;
    }

    /**
     * Get transactions for the current user
     * @param limit - Number of transactions to return
     * @param offset - Number of transactions to skip
     * @returns Transactions
     */
    async getTransactions({ limit = 10, offset = 0, where }: {
        limit?: number,
        offset?: number,
        where?: Partial<Transactions>
    }) {

        const transactions = await this.db.transactions.findMany({
            where: {
                wallet_id: this.walletId,
                ...where
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                recipient: true,
                sender: true
            },
            take: limit,
            skip: offset
        })
        return transactions;
    }

    /**
     * Get payouts for the current wallet
     * @param limit - Number of payouts to return
     * @param offset - Number of payouts to skip
     * @returns Payouts
     */
    async getPayouts({ limit = 10, offset = 0, where }: {
        limit?: number,
        offset?: number,
        where?: Partial<Transactions>
    }) {

        const transactions = await this.db.transactions.findMany({
            where: {
                wallet_id: this.walletId,
                movement_type: TransactionMovementType.OUT,
                ...where
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                recipient: true,
                sender: true
            },
            take: limit,
            skip: offset
        })
        return transactions;
    }

    /**
     * Get a single transaction by id
     * @param id - The id of the transaction
     * @returns The transaction
     */
    async getTransaction(id: string) {
        const transactions = await this.getTransactions({ limit: 1, offset: 0, where: { id } })
        if (transactions.length === 0) {
            return null;
        }
        return transactions[0]
    }

    /**
     * Register a payment
     * @param txId - The id of the transaction
     * @param txHash - The hash of the transaction
     * @param senderId - The id of the sender
     * @param recipientId - The id of the recipient
     * @param amount - The amount of the transaction
     * @param currency - The currency of the transaction
     * @returns The transaction
     */
    async registerPayment({ txId, txHash, senderId, recipientId, amount, currency }: {
        txId: string;
        txHash: string;
        senderId: number;
        recipientId: number;
        amount: bigint;
        currency: string;
    }) {
        const wallet = await this.db.wallet.findUniqueOrThrow({
            where: { id: this.walletId },
        });

        if (!wallet.network || !wallet.network_environment) {
            throw new Error('Wallet network or environment not found');
        }

        const transaction = await this.db.transactions.create({
            data: {
                ts: new Date(),
                movement_type: TransactionMovementType.OUT,
                tx_type: TransactionType.ON_CHAIN_TRANSFER,
                blockchain_network: wallet.network,
                blockchain_environment: wallet.network_environment,
                blockchain_tx_id: txId,
                blockchain_tx_hash: txHash,
                sender_id: senderId,
                recipient_id: recipientId,
                amount: amount,
                currency: currency,
                status: TransactionStatus.COMPLETED,
                wallet_id: this.walletId
            }
        });

        return transaction;
    }
}