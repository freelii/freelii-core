import { Transactions, Wallet } from "@prisma/client";
import dayjs from "dayjs";
import { BaseService } from "../base-service";


interface ITransfer {
    type: 'transfer_out'
    raw: Transactions
}

interface INewWallet {
    type: 'new_wallet'
    raw: Wallet
}

type IActivity = ITransfer | INewWallet

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
        // Transfer
        const transactions = await this.db.transactions.findMany({
            where: {
                sender_id: Number(this.session.user.id),
                created_at: {
                    gte: dayjs().subtract(1, 'week').toDate()
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        const transfers = this.summarizeTransfers(transactions)
        // Deposit
        // Withdrawal
        // Invoice creation
        // Invoice payment
        // Card creation
        const sortedActivity = Object.entries(activity).concat(Object.entries(transfers))
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
            activity[timestamp].push({ type: 'new_wallet', raw: wallet });
        });
        return activity;
    }

    summarizeTransfers(transactions: Transactions[]): ActivityMap {
        const activity: ActivityMap = {};
        transactions.forEach(transaction => {
            const timestamp = dayjs(transaction.created_at).unix();
            if (!activity[timestamp]) {
                activity[timestamp] = [];
            }
            activity[timestamp].push({ type: 'transfer_out', raw: transaction });
        });
        return activity;
    }

}