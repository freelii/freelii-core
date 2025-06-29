import { env } from "@/env";
import { getAsset } from "@/lib/get-asset";
import { type Wallet, type WalletBalance } from "@prisma/client";
import { Asset, Horizon, StrKey, rpc } from "@stellar/stellar-sdk";

interface StellarServiceOptions {
    wallet: Wallet & { balances?: WalletBalance[], main_balance?: WalletBalance | null };
}

export class StellarService {
    readonly horizon: Horizon.Server;
    readonly rpc: rpc.Server;
    readonly network: string;
    readonly networkPassphrase: string;
    readonly wallet: Wallet & { balances?: WalletBalance[], main_balance?: WalletBalance | null };

    constructor(options: StellarServiceOptions) {
        this.wallet = options.wallet;
        this.network = options.wallet.network ?? "";
        this.networkPassphrase = options.wallet.network_environment === "testnet" ?
            env.NEXT_PUBLIC_TESTNET_NETWORK_PASSPHRASE
            : env.NEXT_PUBLIC_MAINNET_NETWORK_PASSPHRASE;
        this.horizon = new Horizon.Server(this.network === "mainnet" ?
            env.NEXT_PUBLIC_MAINNET_HORIZON_URL :
            env.NEXT_PUBLIC_TESTNET_HORIZON_URL);
        this.rpc = new rpc.Server(this.network === "mainnet" ?
            env.NEXT_PUBLIC_MAINNET_RPC_URL :
            env.NEXT_PUBLIC_TESTNET_RPC_URL);
    }

    /**
     * Get the account balance
     * @returns The account balance
     */
    async getAccount() {
        // Get contract Balance

        const indexedSAC = this.wallet.balances?.map(b => getAsset(b.address)) ?? [];
        indexedSAC.push(Asset.native());

        console.log('indexedSAC', indexedSAC);

        if (this.wallet.address) {
            const balancePromises = indexedSAC.map(async sac => {
                const balance = await this.rpc.getSACBalance(
                    String(this.wallet.address),
                    sac,
                    this.networkPassphrase
                );
                const key = `${sac.code}-${sac.issuer ?? ''}`;
                return {
                    key: key === 'XLM-' ? 'XLM' : `${sac.code}-${sac.issuer}`,
                    balance: balance?.balanceEntry?.amount ?? "0"
                };
            });

            const stellarBalances = await Promise.all(balancePromises);
            const balancesToUpdate: WalletBalance[] = [];

            this.wallet.balances?.forEach(walletBalance => {
                const newBalance = stellarBalances.find(
                    stellarBalance => stellarBalance.key === walletBalance.address
                );
                const newAmount = BigInt(newBalance?.balance ?? 0);

                // Track balances that need updating
                if (walletBalance.amount !== newAmount) {
                    walletBalance.amount = newAmount;
                    balancesToUpdate.push(walletBalance);
                }

                if (walletBalance.id === this.wallet.main_balance_id) {
                    this.wallet.main_balance = {
                        ...this.wallet.main_balance,
                        amount: newAmount
                    } as WalletBalance;
                }
            });

            return {
                wallet: this.wallet,
                balancesToUpdate
            };
        }

        return {
            wallet: this.wallet,
            balancesToUpdate: []
        };
    }




    validateAddress() {
        if (!this.wallet.address) {
            return false;
        }
        if (this.wallet.address?.startsWith("G")) {
            return StrKey.isValidEd25519PublicKey(this.wallet.address);
        } else if (this.wallet.address?.startsWith("M")) {
            return StrKey.isValidMed25519PublicKey(this.wallet.address);
        } else if (this.wallet.address?.startsWith("C")) {
            return StrKey.isValidContract(this.wallet.address);
        }
        return false;
    }
}