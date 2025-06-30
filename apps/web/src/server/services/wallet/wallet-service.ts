import { env } from "@/env";
import { BaseService } from "../base-service";
import { EmailService } from "../email/email.service";
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
                network_environment: input.network, // Use the network parameter for environment
                balances: {
                    create: [
                        {
                            address: input.network === "mainnet" ?
                                env.NEXT_PUBLIC_MAINNET_MAIN_BALANCE_CONTRACT_ID :
                                env.NEXT_PUBLIC_TESTNET_MAIN_BALANCE_CONTRACT_ID,
                            currency: 'USDC',
                            amount: 0,
                        },
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
                webhook_url: `${env.NEXT_PUBLIC_APP_URL}/api/soroban-hooks`,
                chainType: input.network === "mainnet" ? "mainnet" : "testnet",
                contractAddress: input.address,
            })
        });
        const data = await response.json();

        // Get user info for email
        const user = await this.db.user.findUniqueOrThrow({
            where: { id: Number(this.session.user.id) },
        });

        // Send sub account created email
        if (user.email) {
            const emailService = new EmailService({
                db: this.db,
                session: this.session,
            });

            try {
                await emailService.sendSubAccountCreatedNotification({
                    to: user.email,
                    userName: user.name || 'User',
                    accountAlias: input.alias,
                    createdDate: new Date().toLocaleDateString(),
                });
            } catch (emailError) {
                console.error('Failed to send sub account creation email:', emailError);
                // Don't fail the wallet creation if email fails
            }
        }

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
        console.log('wallet', wallet);
        if (wallet.network === "stellar") {
            const stellar = new StellarService({ wallet });
            const { wallet: stellarWallet, balancesToUpdate } = await stellar.getAccount();
            console.log('stellarWallet', stellarWallet);
            console.log('balancesToUpdate', balancesToUpdate);
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