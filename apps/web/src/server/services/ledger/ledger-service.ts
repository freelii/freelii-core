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
    async getTransactions({ limit = 10, offset = 0 }: { limit?: number, offset?: number }) {
        const wallet = await this.db.wallet.findUniqueOrThrow({
            where: { id: this.walletId },
            include: { balances: true, main_balance: true }
        });

        const transactions = await this.db.transactions.findMany({
            where: {
                OR: [
                    { sender_id: Number(this.session.user.id) },
                    { recipient_id: Number(this.session.user.id) },
                    { wallet_id: this.walletId }
                ]
            },
            orderBy: {
                created_at: 'desc'
            },
            take: limit,
            skip: offset
        })
        return transactions;
    }
}