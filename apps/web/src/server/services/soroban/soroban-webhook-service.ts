import { type SorobanTransaction } from "prisma/prisma-client";
import { db } from "../../db";

interface SorobanHookData {
    eventType: 'get_contract_transaction';
    data: {
        id: string;
        hash: string;
        ledger: number;
        ts: number;
        protocol: number;
        body: {
            tx?: {
                tx: {
                    source_account: string;
                    fee: number;
                    seq_num: number;
                    cond: any;
                    memo: string;
                    operations: Array<{
                        source_account?: string;
                        body: {
                            invoke_contract?: {
                                contract_address: string;
                                function_name: string;
                                args: Array<any>;
                            };
                            [key: string]: any;
                        };
                    }>;
                    ext: any;
                };
                signatures: Array<{
                    hint: string;
                    signature: string;
                }>;
            };
            tx_fee_bump?: {
                tx: {
                    fee_source: string;
                    fee: number;
                    inner_tx: {
                        tx: {
                            tx: {
                                source_account: string;
                                fee: number;
                                seq_num: number;
                                cond: any;
                                memo: string;
                                operations: Array<{
                                    source_account?: string;
                                    body: {
                                        invoke_contract?: {
                                            contract_address: string;
                                            function_name: string;
                                            args: Array<any>;
                                        };
                                        [key: string]: any;
                                    };
                                }>;
                                ext: any;
                            };
                            signatures: Array<{
                                hint: string;
                                signature: string;
                            }>;
                        };
                    };
                } & { inner_tx: any }; // Add this to ensure inner_tx is accessible
                signatures: Array<{
                    hint: string;
                    signature: string;
                }>;
            };
        };
        meta: {
            v3: {
                ext: string;
                tx_changes_before: Array<any>;
                operations: Array<{ changes: Array<any> }>;
                tx_changes_after: Array<any>;
                soroban_meta: {
                    ext: any;
                    events: Array<{
                        ext: string;
                        contract_id?: string;
                        type: string;
                        body: {
                            v0?: {
                                topics: Array<any>;
                                data: any;
                            };
                        };
                    }>;
                    return_value: string;
                    diagnostic_events: Array<{
                        in_successful_contract_call: boolean;
                        event: {
                            ext: string;
                            contract_id?: string;
                            type: string;
                            body: {
                                v0?: {
                                    topics: Array<any>;
                                    data: any;
                                };
                            };
                        };
                    }>;
                };
            };
        };
        result: {
            transaction_hash: string;
            result: {
                fee_charged: number;
                result: {
                    tx_success?: Array<any>;
                    tx_failed?: any;
                };
                ext: string;
            };
        };
        paging_token: string;
        message: string;
        chain: string;
    };
}

interface WalletMapping {
    walletId: string;
    address: string;
    userId: number;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}

// Simple in-memory cache for idempotency (until database is migrated)
// In production, this should be replaced with database-level idempotency
const processedTransactions = new Map<string, {
    transaction: any;
    walletMappings: WalletMapping[];
    processedAt: Date;
}>();

// Clean up old entries every hour (optional - prevents memory leaks)
setInterval(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [hash, data] of processedTransactions.entries()) {
        if (data.processedAt < oneHourAgo) {
            processedTransactions.delete(hash);
        }
    }
}, 60 * 60 * 1000);

export class SorobanWebhookService {
    /**
     * Extract transaction data from either regular or fee bump transaction structure
     */
    private static extractTransactionData(hookData: SorobanHookData): {
        tx: any;
        signatures: any[];
        sourceAccount: string;
    } {
        if (hookData.data.body.tx) {
            // Regular transaction
            return {
                tx: hookData.data.body.tx.tx,
                signatures: hookData.data.body.tx.signatures,
                sourceAccount: hookData.data.body.tx.tx.source_account
            };
        } else if (hookData.data.body.tx_fee_bump) {
            // Fee bump transaction - extract inner transaction
            const feeBumpTx = hookData.data.body.tx_fee_bump as any;
            return {
                tx: feeBumpTx.tx.inner_tx.tx.tx,
                signatures: feeBumpTx.tx.inner_tx.tx.signatures,
                sourceAccount: feeBumpTx.tx.inner_tx.tx.tx.source_account
            };
        } else {
            throw new Error('Unknown transaction structure - neither tx nor tx_fee_bump found');
        }
    }

    /**
     * Process a Soroban webhook and store the data
     */
    static async processWebhook(hookData: SorobanHookData): Promise<{
        transaction: any; // Will be SorobanTransaction once schema is migrated
        walletMappings: WalletMapping[];
        isNewTransaction: boolean;
    }> {
        console.log('🔄 Processing Soroban webhook for transaction:', hookData.data.hash);

        // Check for idempotency - have we already processed this transaction?
        const existingTransaction = await this.checkExistingTransaction(hookData.data.hash);
        if (existingTransaction) {
            console.log('🔄 Transaction already processed, returning existing record:', {
                hash: hookData.data.hash,
                existingId: existingTransaction.id || 'mock-id',
                processedAt: existingTransaction.created_at || 'unknown'
            });

            // Get wallet mappings for the existing transaction
            const walletMappings = await this.getWalletMappingsForTransaction(existingTransaction);

            return {
                transaction: existingTransaction,
                walletMappings,
                isNewTransaction: false
            };
        }

        console.log('✨ New transaction detected, processing...');

        // Extract addresses from the webhook data
        const addresses = await this.extractAddresses(hookData);
        console.log('📍 Extracted addresses:', addresses);

        // Find matching wallets
        const walletMappings = await this.findMatchingWallets(addresses);
        console.log('🔗 Found wallet mappings:', walletMappings);

        // Extract transaction data for consistent access
        const { sourceAccount } = this.extractTransactionData(hookData);

        // Determine primary wallet and user
        const primaryMapping = this.determinePrimaryMapping(walletMappings, sourceAccount);

        // Store the transaction and related data
        const transaction = await this.storeTransaction(hookData, primaryMapping);

        return { transaction, walletMappings, isNewTransaction: true };
    }

    /**
     * Check if we've already processed this transaction hash
     */
    private static async checkExistingTransaction(transactionHash: string): Promise<SorobanTransaction | null> {
        try {
            console.log('🔍 Checking for existing transaction:', transactionHash);

            // First check in-memory cache (for demonstration until DB is migrated)
            const cachedResult = processedTransactions.get(transactionHash);
            if (cachedResult) {
                console.log('💾 Found in memory cache:', {
                    hash: transactionHash,
                    processedAt: cachedResult.processedAt,
                    walletMappingsCount: cachedResult.walletMappings.length
                });
                return cachedResult.transaction;
            }

            // Check database
            const existingTransaction = await db.sorobanTransaction.findUnique({
                where: { transaction_hash: transactionHash },
                include: {
                    operations: true,
                    events: true,
                    state_changes: true,
                    signatures: true,
                    source_wallet: {
                        select: {
                            id: true,
                            alias: true,
                            address: true,
                            user_id: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (existingTransaction) {
                console.log('🗄️ Found existing transaction in database:', {
                    hash: transactionHash,
                    id: existingTransaction.id,
                    timestamp: existingTransaction.timestamp
                });
                return existingTransaction;
            }

            console.log('✨ Transaction not found in cache or database - proceeding as new');
            return null;
        } catch (error) {
            console.error('❌ Error checking existing transaction:', error);
            // If we can't check, assume it's new to avoid blocking
            return null;
        }
    }

    /**
     * Get wallet mappings from an existing transaction record
     */
    private static async getWalletMappingsForTransaction(existingTransaction: any): Promise<WalletMapping[]> {
        const mappings: WalletMapping[] = [];

        // First check if we have cached wallet mappings (for in-memory demo)
        const transactionHash = existingTransaction.transaction_hash;
        const cachedResult = processedTransactions.get(transactionHash);
        if (cachedResult) {
            console.log('💾 Retrieved wallet mappings from cache');
            return cachedResult.walletMappings;
        }

        // Add source wallet mapping if exists (for database records)
        if (existingTransaction.source_wallet) {
            mappings.push({
                walletId: existingTransaction.source_wallet.id,
                address: existingTransaction.source_wallet.address,
                userId: existingTransaction.source_wallet.user_id,
                confidence: 'high',
                reason: 'Source wallet (from existing record)'
            });
        }

        // TODO: Add mappings from events and state changes once schema is migrated
        /*
        if (existingTransaction.events) {
            existingTransaction.events.forEach(event => {
                if (event.related_wallet) {
                    mappings.push({
                        walletId: event.related_wallet.id,
                        address: event.related_wallet.address,
                        userId: event.related_wallet.user_id,
                        confidence: 'medium',
                        reason: 'Event-related wallet (from existing record)'
                    });
                }
            });
        }
        */

        return mappings;
    }

    /**
     * Extract all possible addresses from the webhook data
     */
    private static async extractAddresses(hookData: SorobanHookData): Promise<Set<string>> {
        const addresses = new Set<string>();

        // Extract transaction data using helper method
        const { tx, sourceAccount } = this.extractTransactionData(hookData);

        // Add source account
        addresses.add(sourceAccount);

        // Extract from operations
        tx.operations.forEach((op: any) => {
            if (op.source_account) {
                addresses.add(op.source_account);
            }

            // Handle different operation types
            if (op.body.invoke_host_function) {
                // Extract from host function invocation
                const hostFunction = op.body.invoke_host_function.host_function;
                if (hostFunction.invoke_contract) {
                    // Add the contract address being invoked
                    addresses.add(hostFunction.invoke_contract.contract_address);

                    // Extract addresses from function arguments
                    if (hostFunction.invoke_contract.args) {
                        this.extractAddressesFromArgs(hostFunction.invoke_contract.args, addresses);
                    }
                }

                // Extract from auth section
                if (op.body.invoke_host_function.auth) {
                    op.body.invoke_host_function.auth.forEach((auth: any) => {
                        if (auth.root_invocation?.function?.contract_fn) {
                            const contractFn = auth.root_invocation.function.contract_fn;
                            addresses.add(contractFn.contract_address);
                            if (contractFn.args) {
                                this.extractAddressesFromArgs(contractFn.args, addresses);
                            }
                        }
                    });
                }
            }

            // Legacy: Contract operations might have addresses in args (for older format)
            if (op.body.invoke_contract?.args) {
                this.extractAddressesFromArgs(op.body.invoke_contract.args, addresses);
            }
        });

        // Extract from Soroban events
        hookData.data.meta.v3.soroban_meta.events.forEach(event => {
            if (event.body.v0) {
                // Topics might contain addresses
                this.extractAddressesFromTopics(event.body.v0.topics, addresses);
                // Data might contain addresses
                this.extractAddressesFromData(event.body.v0.data, addresses);
            }
        });

        // Extract from diagnostic events
        hookData.data.meta.v3.soroban_meta.diagnostic_events.forEach(diagEvent => {
            if (diagEvent.event.body.v0) {
                this.extractAddressesFromTopics(diagEvent.event.body.v0.topics, addresses);
                this.extractAddressesFromData(diagEvent.event.body.v0.data, addresses);
            }
        });

        // Extract from state changes
        [...hookData.data.meta.v3.tx_changes_before, ...hookData.data.meta.v3.tx_changes_after]
            .forEach(change => {
                this.extractAddressesFromStateChange(change, addresses);
            });

        return addresses;
    }

    /**
     * Extract addresses from function arguments
     */
    private static extractAddressesFromArgs(args: any[], addresses: Set<string>): void {
        args.forEach(arg => {
            if (typeof arg === 'string' && this.isStellarAddress(arg)) {
                addresses.add(arg);
            } else if (typeof arg === 'object' && arg !== null) {
                // Check for direct address field (common in Soroban args)
                if (arg.address && typeof arg.address === 'string' && this.isStellarAddress(arg.address)) {
                    addresses.add(arg.address);
                }
                // Recursively search in objects
                this.extractAddressesFromObject(arg, addresses);
            }
        });
    }

    /**
     * Extract addresses from event topics
     */
    private static extractAddressesFromTopics(topics: any[], addresses: Set<string>): void {
        topics.forEach(topic => {
            if (typeof topic === 'string' && this.isStellarAddress(topic)) {
                addresses.add(topic);
            } else if (typeof topic === 'object' && topic !== null) {
                // Check for direct address field (common in Soroban event topics)
                if (topic.address && typeof topic.address === 'string' && this.isStellarAddress(topic.address)) {
                    addresses.add(topic.address);
                }
                this.extractAddressesFromObject(topic, addresses);
            }
        });
    }

    /**
     * Extract addresses from event data
     */
    private static extractAddressesFromData(data: any, addresses: Set<string>): void {
        if (typeof data === 'string' && this.isStellarAddress(data)) {
            addresses.add(data);
        } else if (typeof data === 'object' && data !== null) {
            this.extractAddressesFromObject(data, addresses);
        }
    }

    /**
     * Extract addresses from state changes
     */
    private static extractAddressesFromStateChange(change: any, addresses: Set<string>): void {
        if (change.state?.account_id) {
            const accountId = change.state.account_id;
            if (this.isStellarAddress(accountId)) {
                addresses.add(accountId);
            }
        }
        if (change.updated?.account_id) {
            const accountId = change.updated.account_id;
            if (this.isStellarAddress(accountId)) {
                addresses.add(accountId);
            }
        }
        // Recursively search the entire change object
        this.extractAddressesFromObject(change, addresses);
    }

    /**
     * Recursively extract addresses from any object
     */
    private static extractAddressesFromObject(obj: any, addresses: Set<string>): void {
        if (typeof obj !== 'object' || obj === null) return;

        for (const value of Object.values(obj)) {
            if (typeof value === 'string' && this.isStellarAddress(value)) {
                addresses.add(value);
            } else if (typeof value === 'object' && value !== null) {
                this.extractAddressesFromObject(value, addresses);
            }
        }
    }

    /**
     * Check if a string looks like a Stellar address (account or contract)
     */
    private static isStellarAddress(str: string): boolean {
        // Stellar account addresses start with G and are 56 characters long
        // Stellar contract addresses start with C and are 56 characters long
        return /^[GC][A-Z2-7]{55}$/.test(str);
    }

    /**
     * Find matching wallets for the extracted addresses
     */
    private static async findMatchingWallets(addresses: Set<string>): Promise<WalletMapping[]> {
        const addressArray = Array.from(addresses);

        const wallets = await db.wallet.findMany({
            where: {
                address: {
                    in: addressArray
                },
                OR: [
                    {
                        network: {
                            in: ['stellar', 'STELLAR', 'xlm', 'XLM', 'soroban', 'SOROBAN']
                        }
                    },
                    {
                        network: null // Some wallets might not have network specified
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        });

        return wallets.map((wallet: any) => ({
            walletId: wallet.id,
            address: wallet.address!,
            userId: wallet.user_id,
            confidence: 'high' as const,
            reason: 'Direct address match'
        }));
    }

    /**
     * Determine the primary wallet mapping (usually the source account)
     */
    private static determinePrimaryMapping(
        mappings: WalletMapping[],
        sourceAccount: string
    ): WalletMapping | null {
        // Prefer the source account mapping
        const sourceMapping = mappings.find(m => m.address === sourceAccount);
        if (sourceMapping) {
            return sourceMapping;
        }

        // Otherwise return the first high-confidence mapping
        const highConfidenceMapping = mappings.find(m => m.confidence === 'high');
        if (highConfidenceMapping) {
            return highConfidenceMapping;
        }

        return mappings[0] || null;
    }

    /**
     * Store the transaction and all related data
     */
    private static async storeTransaction(
        hookData: SorobanHookData,
        primaryMapping: WalletMapping | null
    ): Promise<any> {
        const isSuccessful = !!(hookData.data.result.result.result.tx_success?.length) && 
                             !hookData.data.result.result.result.tx_failed;

        try {
            console.log('💾 Storing transaction:', hookData.data.hash);

            // Store the main transaction record
            const sorobanTx = await db.sorobanTransaction.upsert({
                where: {
                    transaction_hash: hookData.data.hash
                },
                update: {
                    updated_at: new Date(),
                    source_wallet_id: primaryMapping?.walletId || undefined,
                    user_id: primaryMapping?.userId || undefined
                },
                create: {
                    transaction_id: hookData.data.id,
                    transaction_hash: hookData.data.hash,
                    ledger: hookData.data.ledger,
                    timestamp: new Date(hookData.data.ts * 1000),
                    protocol: hookData.data.protocol,
                    chain: hookData.data.chain,
                    paging_token: hookData.data.paging_token,
                    message: hookData.data.message,
                    source_account: this.extractTransactionData(hookData).sourceAccount,
                    fee: this.extractTransactionData(hookData).tx.fee,
                    seq_num: BigInt(this.extractTransactionData(hookData).tx.seq_num),
                    memo: this.extractTransactionData(hookData).tx.memo,
                    fee_charged: hookData.data.result.result.fee_charged,
                    return_value: hookData.data.meta.v3.soroban_meta.return_value,
                    is_successful: isSuccessful,
                    error_details: isSuccessful ? null : JSON.stringify(hookData.data.result.result.result.tx_failed),
                    raw_webhook_data: hookData as any,
                    source_wallet_id: primaryMapping?.walletId,
                    user_id: primaryMapping?.userId
                }
            });

            console.log('✅ Main transaction stored:', sorobanTx.id);

            // Check if this is a new transaction by comparing timestamps
            const isNewTransaction = Math.abs(sorobanTx.created_at.getTime() - sorobanTx.updated_at.getTime()) < 1000;

            if (isNewTransaction) {
                console.log('🆕 New transaction - storing related data...');

                // Store all related data individually (no transactions)
                await this.storeAllRelatedData(sorobanTx.id, hookData);

                console.log('✅ All related data stored successfully');
            } else {
                console.log('🔄 Existing transaction, skipping related data');
            }

            // Update in-memory cache
            const walletMappings = await this.findMatchingWallets(await this.extractAddresses(hookData));
            processedTransactions.set(hookData.data.hash, {
                transaction: sorobanTx,
                walletMappings: walletMappings,
                processedAt: new Date()
            });

            return sorobanTx;
        } catch (error: any) {
            if (error.code === 'P2002' && error.meta?.target?.includes('transaction_hash')) {
                console.log('🔄 Duplicate transaction hash, fetching existing...');
                return await this.checkExistingTransaction(hookData.data.hash);
            }

            console.error('❌ Error storing transaction:', error);
            throw error;
        }
    }

    /**
     * Store all related data in separate operations
     */
    private static async storeAllRelatedData(transactionId: string, hookData: SorobanHookData): Promise<void> {
        // Extract transaction data once for consistent access
        const { tx, signatures } = this.extractTransactionData(hookData);

        const operations = [
            // Operations
            async () => {
                if (tx.operations?.length > 0) {
                    console.log('📝 Storing operations...');
                    await this.storeOperations(transactionId, tx.operations);
                }
            },

            // Events
            async () => {
                if (hookData.data.meta.v3.soroban_meta.events?.length > 0) {
                    console.log('📝 Storing events...');
                    await this.storeEvents(transactionId, hookData.data.meta.v3.soroban_meta.events, false);
                }
            },

            // Diagnostic events
            async () => {
                if (hookData.data.meta.v3.soroban_meta.diagnostic_events?.length > 0) {
                    console.log('📝 Storing diagnostic events...');
                    const diagnosticEvents = hookData.data.meta.v3.soroban_meta.diagnostic_events
                        .map(de => de.event)
                        .filter(event => event != null);
                    if (diagnosticEvents.length > 0) {
                        await this.storeEvents(transactionId, diagnosticEvents, true);
                    }
                }
            },

            // State changes before
            async () => {
                if (hookData.data.meta.v3.tx_changes_before?.length > 0) {
                    console.log('📝 Storing state changes (before)...');
                    await this.storeStateChanges(transactionId, hookData.data.meta.v3.tx_changes_before, 'before');
                }
            },

            // State changes after
            async () => {
                if (hookData.data.meta.v3.tx_changes_after?.length > 0) {
                    console.log('📝 Storing state changes (after)...');
                    await this.storeStateChanges(transactionId, hookData.data.meta.v3.tx_changes_after, 'after');
                }
            },

            // Signatures
            async () => {
                if (signatures?.length > 0) {
                    console.log('📝 Storing signatures...');
                    await this.storeSignatures(transactionId, signatures);
                }
            }
        ];

        // Execute each operation individually
        for (const operation of operations) {
            try {
                await operation();
            } catch (error) {
                console.error('⚠️ Error storing related data (continuing):', error);
                // Continue with other operations even if one fails
            }
        }
    }

    /**
     * Generate a consistent idempotency key from transaction hash
     */
    private static generateIdempotencyKey(transactionHash: string): string {
        // Create a deterministic ID based on the transaction hash
        // This ensures the same transaction always gets the same ID
        return `soroban-${transactionHash.substring(0, 8)}-${transactionHash.substring(-8)}`;
    }

    private static async storeOperations(transactionId: string, operations: any[]): Promise<void> {
        for (let i = 0; i < operations.length; i++) {
            const op = operations[i];

            // Handle different operation structures
            let operationType = 'unknown';
            let contractAddress = null;
            let functionName = null;
            let functionArgs = null;

            if (op.body.invoke_host_function) {
                operationType = 'invoke_host_function';
                const hostFunction = op.body.invoke_host_function.host_function;
                if (hostFunction.invoke_contract) {
                    contractAddress = hostFunction.invoke_contract.contract_address;
                    functionName = hostFunction.invoke_contract.function_name;
                    functionArgs = hostFunction.invoke_contract.args;
                }
            } else if (op.body.invoke_contract) {
                operationType = 'invoke_contract';
                contractAddress = op.body.invoke_contract.contract_address;
                functionName = op.body.invoke_contract.function_name;
                functionArgs = op.body.invoke_contract.args;
            } else {
                operationType = Object.keys(op.body)[0] || 'unknown';
            }

            await db.sorobanOperation.create({
                data: {
                    transaction_id: transactionId,
                    operation_index: i,
                    operation_type: operationType,
                    source_account: op.source_account,
                    contract_address: contractAddress,
                    function_name: functionName,
                    function_args: functionArgs,
                    raw_operation_data: op
                }
            });
        }
    }

    private static async storeEvents(transactionId: string, events: any[], isDiagnostic: boolean): Promise<void> {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (!event) continue; // Skip null/undefined events

            await db.sorobanEvent.create({
                data: {
                    transaction_id: transactionId,
                    event_index: i,
                    event_type: event.type_ || event.type || 'unknown',
                    contract_id: event.contract_id,
                    topics: event.body?.v0?.topics || [],
                    data: event.body?.v0?.data,
                    is_diagnostic: isDiagnostic,
                    raw_event_data: event
                }
            });
        }
    }

    private static async storeStateChanges(transactionId: string, changes: any[], changeType: string): Promise<void> {
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            if (!change) continue; // Skip null/undefined changes

            const changeKind = Object.keys(change)[0] || 'unknown';

            await db.sorobanStateChange.create({
                data: {
                    transaction_id: transactionId,
                    change_index: i,
                    change_type: changeType,
                    change_kind: changeKind,
                    affected_address: this.extractAddressFromChange(change),
                    raw_change_data: change
                }
            });
        }
    }

    private static async storeSignatures(transactionId: string, signatures: any[]): Promise<void> {
        for (let i = 0; i < signatures.length; i++) {
            const sig = signatures[i];
            if (!sig) continue; // Skip null/undefined signatures

            await db.sorobanSignature.create({
                data: {
                    transaction_id: transactionId,
                    signature_index: i,
                    hint: sig.hint,
                    signature: sig.signature
                }
            });
        }
    }

    private static extractAddressFromChange(change: any): string | null {
        if (change.state?.account_id && this.isStellarAddress(change.state.account_id)) {
            return change.state.account_id;
        }
        if (change.updated?.account_id && this.isStellarAddress(change.updated.account_id)) {
            return change.updated.account_id;
        }
        return null;
    }

    /**
     * Get transaction history for a specific wallet
     */
    static async getWalletTransactions(walletId: string) {
        console.log('📊 Getting transactions for wallet:', walletId);

        try {
            return await db.sorobanTransaction.findMany({
                where: {
                    OR: [
                        { source_wallet_id: walletId },
                        // Note: We'll need to add wallet relationships to events and state_changes for these filters
                        // For now, just filter by source_wallet_id
                    ]
                },
                include: {
                    operations: true,
                    events: true,
                    state_changes: true,
                    signatures: true,
                    source_wallet: {
                        select: {
                            id: true,
                            alias: true,
                            address: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    timestamp: 'desc'
                }
            });
        } catch (error) {
            console.error('❌ Error fetching wallet transactions:', error);

            // Fallback to memory cache if database fails
            const transactions = [];
            for (const [hash, data] of processedTransactions.entries()) {
                const hasWalletMapping = data.walletMappings.some(mapping => mapping.walletId === walletId);
                if (hasWalletMapping) {
                    transactions.push({
                        ...data.transaction,
                        walletMappings: data.walletMappings
                    });
                }
            }
            return transactions;
        }
    }

    /**
     * Get transaction by hash
     */
    static async getTransactionByHash(hash: string) {
        console.log('🔍 Getting transaction by hash:', hash);

        try {
            return await db.sorobanTransaction.findUnique({
                where: { transaction_hash: hash },
                include: {
                    operations: true,
                    events: true,
                    state_changes: true,
                    signatures: true,
                    source_wallet: true,
                    user: true
                }
            });
        } catch (error) {
            console.error('❌ Error fetching transaction by hash:', error);

            // Fallback to memory cache if database fails
            const cachedResult = processedTransactions.get(hash);
            return cachedResult?.transaction || null;
        }
    }
} 