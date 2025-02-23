import { WalletBalance } from '@/interfaces/wallet.interface';
import { PrismaClient, WalletStatus } from '@prisma/client';
import { CreateWalletDto, TransferDto } from '../dtos/wallet.dto';
import { ApiError } from '../middleware/error-handler';
import { CircleService } from './circle.service';

export class WalletService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getWallets(userId: string) {
        const circleService = new CircleService();
        const wallets = await circleService.getWallets();
        console.log('wallets:', wallets);
        return wallets;
        // return this.prisma.wallet.findMany({
        //     where: { user_id: Number(userId) },
        //     include: {
        //         balances: true,
        //         main_balance: true,
        //     },
        // });
    }

    async createWallet(userId: string, data: CreateWalletDto) {
        const circleService = new CircleService();
        // Create the wallet with a single balance
        const wallet = await this.prisma.wallet.create({
            data: {
                user_id: userId,
                alias: data.alias,
                external_id: data.externalId,
                state: WalletStatus.UNLINKED
            },
            select: {
                id: true,
            },
        });
        console.log('wallet', wallet);

        const { wallet: newWallet, walletSet } = await circleService.createWallet(wallet.id, data.alias);
        if (!walletSet || !newWallet) {
            throw new ApiError(500, 'Failed to create wallet set');
        }
        console.log('newWallet:', newWallet);
        console.log('walletSet:', walletSet);

        // Update the wallet and wallet set in a transaction
        await this.prisma.$transaction(async (tx) => {
            const { id: walletSetId } = await tx.walletSet.create({
                data: {
                    circle_id: walletSet.id,
                    user_id: userId,
                },
                select: {
                    id: true,
                },
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    state: WalletStatus.LIVE,
                    solana_address: newWallet.address,
                    wallet_set_id: walletSetId,
                    circle_wallet_set_id: newWallet.walletSetId,
                    circle_wallet_id: newWallet.id,
                },
            });
        });




        return this.getWallet(userId, wallet.id);
    }

    async getWallet(userId: string, walletId: string) {
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                id: walletId,
                user_id: userId,
            },
        });

        if (!wallet) {
            throw new ApiError(404, 'Wallet not found');
        }

        return wallet;
    }

    async getWalletBalance(_userId: string, walletId: string): Promise<WalletBalance> {
        const wallet = await this.getWallet(_userId, walletId);
        console.log('wallet:', wallet);
        if (!wallet?.circle_wallet_id) {
            throw new ApiError(404, 'Wallet not found');
        }
        const circleService = new CircleService();
        const balances = await circleService.getWalletBalance(wallet.circle_wallet_id);
        console.log('balances:', balances);
        balances?.tokenBalances?.forEach((t: any) => console.log('t:', t));
        const usdcBalance = balances?.tokenBalances?.find((t: any) => t.token?.symbol === 'USDC');
        console.log('usdcBalance:', usdcBalance);
        const pendingCredits = '0';
        return {
            confirmedBalance: usdcBalance?.amount ?? '0',
            pendingCredits: pendingCredits,
            totalBalance: (Number(usdcBalance?.amount ?? '0') + Number(pendingCredits)).toString(),
        };
    }

    async transfer(_userId: string, walletId: string, transferData: TransferDto) {
        const circleService = new CircleService();
        return circleService.transfer(walletId, transferData.amount, transferData.tokenId);
    }
} 