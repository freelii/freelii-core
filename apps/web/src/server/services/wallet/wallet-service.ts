import { TESTNET } from "@freelii/utils/constants";
import { MAINNET } from "@freelii/utils/constants/stellar-sac";
import { BaseService } from "../base-service";
import { StellarService } from "../stellar/stellar-service";
interface CreateWalletInput {
    alias: string;
    isDefault: boolean;
    network: string;
    address: string;
    keyId: string;
}

export class WalletService extends BaseService {


    /**
     * Create a new wallet
     * @param input - The input for creating a wallet
     * @returns The created wallet
     */
    async createWallet(input: CreateWalletInput) {
        // First create the wallet with a single balance
        const wallet = await this.db.wallet.create({
            data: {
                alias: input.alias,
                isDefault: input.isDefault,
                userId: Number(this.session.user.id),
                keyId: input.keyId,
                address: input.address,
                network: 'stellar',
                networkEnvironment: 'testnet',
                balances: {
                    create: [
                        {
                            address: 'XLM',
                            currency: 'XLM',
                            amount: 0,
                        },
                        {
                            address: input.network === "mainnet" ? MAINNET.USDC_SAC : TESTNET.USDC_SAC,
                            currency: "USDC",
                            amount: 0,
                        }
                    ],
                },
            },
            include: {
                balances: true,
            },
        });

        // Then update the wallet to set the USDC balance as the main balance
        const usdcBalance = wallet.balances.find(b => b.currency === "USDC");
        if (!usdcBalance) {
            throw new Error('USDC balance not created');
        }

        const updatedWallet = await this.db.wallet.update({
            where: { id: wallet.id },
            data: {
                mainBalanceId: usdcBalance.id,
            },
            include: {
                balances: true,
                mainBalance: true,
            },
        });
        return updatedWallet;
    }

    async getAccount(walletId: string) {
        const wallet = await this.db.wallet.findUniqueOrThrow({
            where: { id: walletId, userId: Number(this.session.user.id) },
            include: {
                balances: true,
                mainBalance: true,
            },
        });
        console.log('wallet.getAccount', wallet);
        if (wallet.network === "stellar") {
            const stellar = new StellarService({ wallet });
            return stellar.getAccount();
        }
        return null;
    }
}