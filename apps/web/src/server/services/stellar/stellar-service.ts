import { getAsset } from "@/lib/get-asset";
import { MAINNET, TESTNET } from "@freelii/utils/constants/stellar-sac";
import { Wallet, WalletBalance } from "@prisma/client";
import { Asset, Horizon, rpc, StrKey } from "@stellar/stellar-sdk";

interface StellarServiceOptions {
    wallet: Wallet & { balances?: WalletBalance[], main_balance?: WalletBalance | null };
}

export class StellarService {
    readonly horizon: Horizon.Server;

    readonly network: string;
    readonly networkPassphrase: string;
    readonly wallet: Wallet & { balances?: WalletBalance[], main_balance?: WalletBalance | null };

    constructor(options: StellarServiceOptions) {
        this.wallet = options.wallet;
        this.network = options.wallet.network ?? "";
        this.networkPassphrase = options.wallet.network_environment === "testnet" ? TESTNET.PASSPHRASE : MAINNET.PASSPHRASE;
        this.horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
    }

    /**
     * Get the account balance
     * @returns The account balance
     */
    async getAccount() {
        // Get contract Balance
        const sorobanServer = new rpc.Server("https://soroban-testnet.stellar.org");
        const indexedSAC = this.wallet.balances?.map(b => getAsset(b.address)) ?? [];
        indexedSAC.push(Asset.native());

        if (this.wallet.address) {
            const balancePromises = indexedSAC.map(async sac => {
                const balance = await sorobanServer.getSACBalance(
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