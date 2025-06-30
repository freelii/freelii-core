import { env } from "@/env";
import { addressToSac, getAsset } from "@/lib/get-asset";
import { type Wallet, type WalletBalance } from "@prisma/client";
import { Address, Asset, Horizon, Keypair, StrKey, nativeToScVal, rpc, xdr } from "@stellar/stellar-sdk";


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
        const nonRepeatedSAC = new Set(this.wallet.balances?.map(b => b.address) ?? []);
        console.log('nonRepeatedSAC', nonRepeatedSAC);
        const indexedSAC = Array.from(nonRepeatedSAC).map(b => getAsset(b));
        console.log('indexedSAC', indexedSAC);

        if (this.wallet.address) {
            const balancePromises = indexedSAC.map(async sac => {
                console.log('this.wallet.address', this.wallet.address);
                console.log('sac', sac);
                console.log('this.networkPassphrase', this.networkPassphrase);

                try {
                    const balance = await this.rpc.getSACBalance(
                        String(this.wallet.address),
                        sac,
                        this.networkPassphrase
                    );
                    console.log('balance response:', JSON.stringify(balance, null, 2));

                    // Check if balance has the expected structure
                    if (!balance?.balanceEntry) {
                        console.warn(`No balance entry found for asset ${sac.code}-${sac.issuer} on account ${this.wallet.address}`);

                        // Use getLedgerEntries for more detailed diagnosis
                        // const diagnosis = await this.diagnoseBalanceIssue(String(this.wallet.address), sac);
                        // console.log('Diagnosis:', diagnosis);

                        // return {
                        //     key: sac.code === 'XLM' ? 'XLM' : `${sac.code}-${sac.issuer}`,
                        //     balance: "0"
                        // };
                    } else {
                        const key = `${sac.code}-${sac.issuer ?? ''}`;
                        console.log('key', key);
                        if ('amount' in balance.balanceEntry) {
                            return {
                                key: key === 'XLM-' ? 'XLM' : `${sac.code}-${sac.issuer}`,
                                balance: balance.balanceEntry.amount ?? "0"
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Error getting balance for asset ${sac.code}-${sac.issuer}:`, error);
                }
            });

            const stellarBalances = await Promise.all(balancePromises);
            console.log('stellarBalances', stellarBalances);
            const balancesToUpdate: WalletBalance[] = [];

            const filteredBalances = stellarBalances.filter(b => b);
            console.log('filteredBalances', filteredBalances);
            this.wallet.balances?.forEach(walletBalance => {
                const newBalance = filteredBalances.find(
                    stellarBalance => addressToSac(stellarBalance?.key ?? '') === walletBalance.address
                );
                const newAmount = BigInt(newBalance?.balance ?? 0);

                // Track balances that need updating
                if (newBalance && walletBalance.amount !== newAmount) {
                    walletBalance.amount = newAmount;
                    balancesToUpdate.push(walletBalance);
                }

                if (walletBalance.id === this.wallet.main_balance_id) {
                    this.wallet.main_balance = {
                        ...this.wallet.main_balance,
                        amount: walletBalance.amount,
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

    /**
     * Diagnose why a balance query failed using direct ledger queries
     * @param accountAddress - The account address to check
     * @param asset - The asset to check
     * @returns Diagnosis information
     */
    async diagnoseBalanceIssue(accountAddress: string, asset: Asset) {
        try {
            // Check if this is a contract address or regular account
            const isContract = accountAddress.startsWith('C');
            const isAccount = accountAddress.startsWith('G');

            if (!isContract && !isAccount) {
                return {
                    issue: 'INVALID_ADDRESS_FORMAT',
                    message: `Invalid address format: ${accountAddress}`,
                    error: 'Address must start with G (account) or C (contract)'
                };
            }

            if (isContract) {
                // For contracts, we need to query the asset's contract for balance data
                try {
                    // Get the asset contract address (the contract that manages this asset)
                    const assetContractAddress = asset.contractId(this.networkPassphrase);
                    console.log('Asset contract address:', assetContractAddress);
                    console.log('Holder contract address:', accountAddress);

                    // Create the balance key according to SAC specification
                    // Balance storage format: Balance(holder_address)
                    const balanceKey = nativeToScVal({
                        tag: "Balance",
                        values: [new Address(accountAddress)]
                    }, { type: "instance" });

                    console.log('Querying balance key:', balanceKey);

                    // Query the asset contract for this balance
                    const balanceData = await this.rpc.getContractData(
                        assetContractAddress,
                        balanceKey
                    );

                    console.log('Found balance data:', balanceData);

                    return {
                        issue: 'CONTRACT_BALANCE_FOUND_VIA_DIRECT_QUERY',
                        message: `Found balance data for contract ${accountAddress} in asset ${asset.code}`,
                        balanceData: balanceData,
                        explanation: 'getSACBalance failed but direct contract query succeeded'
                    };

                } catch (directQueryError) {
                    console.log('Direct query error:', directQueryError);

                    // Try alternative balance key format
                    try {
                        const alternativeKey = xdr.ScVal.scvVec([
                            nativeToScVal("Balance", { type: "symbol" }),
                            new Address(accountAddress).toScVal()
                        ]);

                        const assetContractAddress = asset.contractId(this.networkPassphrase);
                        const balanceData = await this.rpc.getContractData(
                            assetContractAddress,
                            alternativeKey
                        );

                        console.log('Found balance with alternative key:', balanceData);

                        return {
                            issue: 'CONTRACT_BALANCE_FOUND_WITH_ALT_KEY',
                            message: `Found balance using alternative key format`,
                            balanceData: balanceData
                        };

                    } catch (altError) {
                        console.log('Alternative key also failed:', altError);

                        return {
                            issue: 'CONTRACT_BALANCE_QUERY_FAILED',
                            message: `Could not find balance data for contract ${accountAddress}`,
                            explanation: 'Both getSACBalance and direct contract queries failed',
                            errors: {
                                getSACBalance: 'returned only latestLedger',
                                directQuery: directQueryError instanceof Error ? directQueryError.message : String(directQueryError),
                                alternativeQuery: altError instanceof Error ? altError.message : String(altError)
                            },
                            suggestion: 'Contract may not have this asset balance or storage format is different'
                        };
                    }
                }
            }

            // 1. Check if the account exists (only for regular accounts)
            const accountLedgerKey = xdr.LedgerKey.account(
                new xdr.LedgerKeyAccount({
                    accountId: Keypair.fromPublicKey(accountAddress).xdrAccountId(),
                })
            );

            const accountResponse = await this.rpc.getLedgerEntries(accountLedgerKey);

            if (!accountResponse.entries || accountResponse.entries.length === 0) {
                return {
                    issue: 'ACCOUNT_NOT_FOUND',
                    message: `Account ${accountAddress} does not exist on the network`,
                    latestLedger: accountResponse.latestLedger
                };
            }

            console.log('✓ Account exists');

            // 2. For native XLM, account should have balance
            if (asset.isNative()) {
                const accountData = accountResponse.entries[0];
                // Parse the account entry to get native balance
                return {
                    issue: 'NATIVE_BALANCE_FOUND',
                    message: 'Account exists but getSACBalance failed for native asset',
                    accountData: accountData,
                    latestLedger: accountResponse.latestLedger
                };
            }

            // 3. For non-native assets, check if trustline exists
            const trustlineLedgerKey = xdr.LedgerKey.trustline(
                new xdr.LedgerKeyTrustLine({
                    accountId: Keypair.fromPublicKey(accountAddress).xdrAccountId(),
                    asset: asset.toTrustLineXDRObject(),
                })
            );

            const trustlineResponse = await this.rpc.getLedgerEntries(trustlineLedgerKey);

            if (!trustlineResponse.entries || trustlineResponse.entries.length === 0) {
                return {
                    issue: 'TRUSTLINE_NOT_FOUND',
                    message: `Account ${accountAddress} has no trustline for asset ${asset.code}:${asset.issuer}`,
                    suggestion: 'The account needs to establish a trustline for this asset first',
                    latestLedger: trustlineResponse.latestLedger
                };
            }

            // 4. Trustline exists, check its details
            const trustlineData = trustlineResponse.entries[0];
            return {
                issue: 'TRUSTLINE_EXISTS_BUT_SAC_FAILED',
                message: 'Trustline exists but getSACBalance failed - possible RPC or network issue',
                trustlineData: trustlineData,
                latestLedger: trustlineResponse.latestLedger
            };

        } catch (error) {
            return {
                issue: 'DIAGNOSIS_ERROR',
                message: 'Error during diagnosis',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}