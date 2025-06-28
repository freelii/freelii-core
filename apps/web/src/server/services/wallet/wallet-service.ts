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

    readonly mainCurrency = "XLM"



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
                is_default: input.isDefault,
                user_id: Number(this.session.user.id),
                key_id: input.keyId,
                address: input.address,
                network: 'stellar',
                network_environment: 'testnet',
                balances: {
                    create: [
                        {
                            address: 'XLM',
                            currency: 'USDC',
                            amount: 0,
                        },
                        // {
                        //     address: input.network === "mainnet" ? MAINNET.USDC : TESTNET.USDC,
                        //     currency: "USDC",
                        //     amount: 0,
                        // }
                    ],
                },
            },
            include: {
                balances: true,
            },
        });

        // Then update the wallet to set the USDC balance as the main balance
        const mainBalance = wallet.balances.find(b => b.currency === this.mainCurrency) ?? wallet.balances[0];
        if (!mainBalance) {
            throw new Error('Main balance not created');
        }

        const updatedWallet = await this.db.wallet.update({
            where: { id: wallet.id },
            data: {
                main_balance_id: mainBalance.id,
            },
            include: {
                balances: true,
                main_balance: true,
            },
        });

        // Link Soroban Hooks
        const response = await fetch('https://api.sorobanhooks.xyz/v1/api/get_contract_transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': '8dm66xwns7arh3uhvdkdh'
            },
            body: JSON.stringify({
                webhook_url: 'https://ringtail-wealthy-adversely.ngrok-free.app/api/soroban-hooks',
                chainType: 'testnet',
                contractAddress: input.address,
            })
        });
        const data = await response.json();
        console.log('Soroban Hooks', data);
        return updatedWallet;
    }

    /**
     * Get the account for a wallet
     * @param walletId - The ID of the wallet
     * @returns The account for the wallet
     */
    async getAccount(walletId: string) {
        const wallet = await this.db.wallet.findUniqueOrThrow({
            where: { id: walletId, user_id: Number(this.session.user.id) },
            include: {
                balances: true,
                main_balance: true,
            },
        });
        if (wallet.network === "stellar") {
            const stellar = new StellarService({ wallet });
            const { wallet: stellarWallet, balancesToUpdate } = await stellar.getAccount();
            if (balancesToUpdate.length > 0) {
                await Promise.all(
                    balancesToUpdate.map(balance =>
                        this.db.walletBalance.update({
                            where: { id: balance.id },
                            data: { amount: balance.amount }
                        })
                    )
                );
            }
            return stellarWallet;
        }
        return null;
    }
}