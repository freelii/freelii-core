import { getAsset } from "@/lib/get-asset";
import { MAINNET, TESTNET } from "@freelii/utils/constants/stellar-sac";
import { Wallet, WalletBalance } from "@prisma/client";
import { Asset, Horizon, rpc, StrKey } from "@stellar/stellar-sdk";

interface StellarServiceOptions {
    wallet: Wallet & { balances?: WalletBalance[], mainBalance?: WalletBalance | null };
}

export class StellarService {
    readonly horizon: Horizon.Server;

    readonly network: string;
    readonly networkPassphrase: string;
    readonly wallet: Wallet & { balances?: WalletBalance[], mainBalance?: WalletBalance | null };

    constructor(options: StellarServiceOptions) {
        this.wallet = options.wallet;
        this.network = options.wallet.network ?? "";
        this.networkPassphrase = options.wallet.networkEnvironment === "testnet" ? TESTNET.PASSPHRASE : MAINNET.PASSPHRASE;
        this.horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
    }


    public async getContractTransactions(
        contractId: string,
        request: rpc.Api.GetTransactionsRequest
    ): Promise<rpc.Api.GetTransactionsResponse> {
        if (!StrKey.isValidContract(contractId)) {
            throw new TypeError(`expected contract ID, got ${contractId}`);
        }

        const sorobanServer = new rpc.Server("https://soroban-testnet.stellar.org");
        return await sorobanServer.getTransactions(request);
    }


    async getAllContractTransactions(
        contractId: string
    ): Promise<rpc.Api.TransactionInfo[]> {
        const server = new rpc.Server("https://soroban-testnet.stellar.org");
        console.log('fetching ledger bounds');
        // First get the ledger bounds
        const last = await server.getLatestLedger();
        console.log('latestLedger (from server):', last);
        // First get the ledger bounds
        const { oldestLedger, latestLedger } = await server.getTransactions({
            startLedger: last.sequence,
            limit: 1         // we just want the ledger bounds
        });
        console.log('oldestLedger:', oldestLedger);
        console.log('latestLedger:', latestLedger);



        const allTransactions: rpc.Api.TransactionInfo[] = [];
        const PAGE_LIMIT = 100; // Reasonable page size

        let currentLedger = latestLedger; // Start from beginning
        let hasMore = true;

        do {
            const response = await this.getContractTransactions(contractId, {
                startLedger: 960405,
                limit: PAGE_LIMIT
            });

            console.log(`response for ${currentLedger}, Limit: ${PAGE_LIMIT}, Length: ${response.transactions.length}, Latest Ledger: ${response.latestLedger}`);

            // Filter transactions that involve the specified contract
            const filteredTransactions = response.transactions.filter(tx => {
                // Check if the transaction has operations involving the contract
                if (tx.envelopeXdr && tx.status === rpc.Api.GetTransactionStatus.SUCCESS) {
                    // const operations = tx.envelopeXdr.v1().tx().operations();

                    // Look through operations for contract interactions
                    // for (let i = 0; i < operations.length; i++) {
                    //     const op = operations[i];
                    //     console.log('op', op?.body().switch().name);
                    //     // First check if this is a host function operation
                    //     if (op?.body().switch().name === 'invokeHostFunction') {
                    //         const hostFunction = op.body().invokeHostFunctionOp().hostFunction()
                    //         console.log('hostFunction args', hostFunction.switch().name);
                    //         if (hostFunction.switch().name === 'hostFunctionTypeInvokeContract') {
                    //             const args = hostFunction.invokeContract();
                    //             const contractAddress = args.contractAddress().contractId().toString();
                    //             console.log('contractAddress', contractAddress);
                    //             if (contractAddress === contractId) {
                    //                 return true;
                    //             }
                    //         }
                    //     } else if (op?.body().switch().name === 'payment') {
                    //         // Compare if payment was made by/to the contract
                    //         const payment = op.body().paymentOp();
                    //         const destination = payment.destination().ed25519();
                    //         const dest = payment.destination().ed25519();
                    //         console.log('payment', payment, destination, dest.toString());
                    //         if (destination.toString() === contractId) {
                    //             return true;
                    //         }
                    //     }
                    // }
                    // }
                }
            });


            allTransactions.push(...filteredTransactions);

            // Update for next iteration
            if (currentLedger <= (latestLedger - 20)) {
                hasMore = false;
            } else {
                currentLedger -= 1;
            }
        } while (false);

        return allTransactions;
    }



    async getTransactions() {
        console.log('getting transactions');
        if (!this.wallet.address) {
            return [];
        }
        if (!this.validateAddress()) {
            throw new Error("Invalid Stellar Wallet address");
        }
        console.log('here1');
        // Usage:

        try {
            // const transactions = await this.getAllContractTransactions(this.wallet.address);
            // console.log(`Found ${transactions.length} transactions for contract`);

            // // Process transactions...
            // transactions.forEach(tx => {
            //     console.log("Transaction:", {
            //         hash: tx.txHash,
            //         ledger: tx.ledger,
            //         createdAt: new Date(tx.createdAt * 1000).toISOString()
            //     });
            // });
            return [];
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }

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
                if (key === 'XLM-') {
                    return {
                        key: 'XLM',
                        balance: balance?.balanceEntry?.amount ?? "0"
                    };
                }
                return {
                    key: `${sac.code}-${sac.issuer}`,
                    balance: balance?.balanceEntry?.amount ?? "0"
                };
            });

            const stellarBalances = await Promise.all(balancePromises);

            this.wallet.balances?.forEach(walletBalance => {
                const amount = Number(stellarBalances.find(stellarBalance => stellarBalance.key === walletBalance.address)?.balance ?? 0);
                walletBalance.amount = amount;
                if (walletBalance.id === this.wallet.mainBalanceId) {
                    this.wallet.mainBalance = {
                        ...this.wallet.mainBalance,
                        amount
                    } as WalletBalance;
                }
            });
        }

        console.log('stellarBalances', this.wallet);
        return this.wallet;
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