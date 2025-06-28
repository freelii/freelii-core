import { type Invoice, type PaymentOrchestrationState, type SorobanTransaction, type Wallet } from "@prisma/client";
import dayjs from "dayjs";
import { BaseService } from "../base-service";


interface ITransfer {
    type: 'transfer_out'
    raw: PaymentOrchestrationState & { wallet?: Wallet | null }
}

interface INewWallet {
    type: 'new_wallet'
    raw: Wallet
}

interface IInvoiceReceived {
    type: 'invoice_received'
    raw: Invoice
}

interface IInvoiceCreated {
    type: 'invoice_created'
    raw: Invoice
}

interface ISorobanTransaction {
    type: 'soroban_transaction'
    raw: SorobanTransaction & { source_wallet?: Wallet | null }
}

type IActivity = ITransfer | INewWallet | IInvoiceReceived | IInvoiceCreated | ISorobanTransaction

type ActivityMap = Record<number, IActivity[]>

export class ActivityService extends BaseService {


    async getActivity(items = 7) {
        // Wallet creation
        const newWallets = await this.db.wallet.findMany({
            where: {
                user_id: Number(this.session.user.id),
                created_at: {
                    gte: dayjs().subtract(1, 'week').toDate()
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        const activity = this.summarizeWalletCreation(newWallets)

        // Transfer with wallet information
        const payments = await this.db.paymentOrchestrationState.findMany({
            where: {
                sender_id: Number(this.session.user.id),
                created_at: {
                    gte: dayjs().subtract(1, 'week').toDate()
                }
            },
            include: {
                wallet: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        const transfers = this.summarizeTransfers(payments)

        // Soroban Transactions (Advanced Banking Services) with wallet information
        const sorobanTransactions = await this.db.sorobanTransaction.findMany({
            where: {
                user_id: Number(this.session.user.id),
                created_at: {
                    gte: dayjs().subtract(1, 'week').toDate()
                }
            },
            include: {
                operations: true,
                source_wallet: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        const sorobanActivity = this.summarizeSorobanTransactions(sorobanTransactions)

        // Invoice received (no direct wallet relationship)
        const invoices = await this.db.invoice.findMany({
            where: {
                receiver_id: Number(this.session.user.id),
                created_at: {
                    gte: dayjs().subtract(1, 'week').toDate()
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        const invoiceReceived = this.summarizeInvoiceReceived(invoices, 'received')

        // Invoice created (no direct wallet relationship)
        const invoicesCreated = await this.db.invoice.findMany({
            where: {
                generator_id: Number(this.session.user.id),
                created_at: {
                    gte: dayjs().subtract(1, 'week').toDate()
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const invoiceCreatedSorted = this.summarizeInvoiceReceived(invoicesCreated, 'created')

        // Combine all activities and sort by timestamp
        const sortedActivity = Object.entries(activity)
            .concat(Object.entries(transfers))
            .concat(Object.entries(sorobanActivity))
            .concat(Object.entries(invoiceReceived))
            .concat(Object.entries(invoiceCreatedSorted))
            .sort(([timestampA], [timestampB]) => {
                return Number(timestampB) - Number(timestampA)
            })
            .map(([_, values]) => Array.isArray(values) ? values : [values])
            .flat();

        return sortedActivity.slice(0, items);
    }

    summarizeWalletCreation(wallets: Wallet[]): ActivityMap {
        const activity: ActivityMap = {};
        wallets.forEach(wallet => {
            const timestamp = dayjs(wallet.created_at).unix();
            if (!activity[timestamp]) {
                activity[timestamp] = [];
            }
            activity[timestamp]!.push({ type: 'new_wallet', raw: wallet });
        });
        return activity;
    }

    summarizeTransfers(payments: PaymentOrchestrationState[]): ActivityMap {
        const activity: ActivityMap = {};
        payments.forEach(payment => {
            const timestamp = dayjs(payment.created_at).unix();
            if (!activity[timestamp]) {
                activity[timestamp] = [];
            }
            activity[timestamp]!.push({ type: 'transfer_out', raw: payment });
        });
        return activity;
    }

    summarizeSorobanTransactions(transactions: SorobanTransaction[]): ActivityMap {
        const activity: ActivityMap = {};
        transactions.forEach(transaction => {
            const timestamp = dayjs(transaction.created_at).unix();
            if (!activity[timestamp]) {
                activity[timestamp] = [];
            }
            activity[timestamp]!.push({ type: 'soroban_transaction', raw: transaction });
        });
        return activity;
    }

    summarizeInvoiceReceived(invoices: Invoice[], type: 'received' | 'created'): ActivityMap {
        const activity: ActivityMap = {};
        invoices.forEach(invoice => {
            const timestamp = dayjs(invoice.created_at).unix();
            if (!activity[timestamp]) {
                activity[timestamp] = [];
            }
            if (type === 'received') {
                activity[timestamp]!.push({ type: 'invoice_received', raw: invoice });
            } else {
                activity[timestamp]!.push({ type: 'invoice_created', raw: invoice });
            }
        });
        return activity;
    }

}