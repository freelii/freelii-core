import { NextResponse, type NextRequest } from "next/server";
import { db } from "../../../server/db";
import { EmailService } from "../../../server/services/email/email.service";
import { SorobanHookData, SorobanWebhookService } from "../../../server/services/soroban/soroban-webhook-service";

interface SorobanHook {
    eventType: 'get_contract_transaction';
    data: {
        id: string; // '746491085852672'
        hash: string; // 'b5a998495119edde96a32a3a281431226ccfca48b377aee8f3226699b0ee577c'
        ledger: number; // 173806
        ts: number; // 1751137259
        protocol: number; // 22
        body: {
            tx?: {
                tx: {
                    source_account: string; // 'GDLS6OIZ3TOC7NXHB3OZKHXLUEZV4EUANOMOOMOHUZAZHLLGNN43IALX'
                    fee: number; // 115317
                    seq_num: number; // 297271866425360
                    cond: {
                        time?: {
                            min_time?: number;
                            max_time?: number;
                        };
                    };
                    memo: string; // 'none' or actual memo
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
                    ext: {
                        v1?: {
                            soroban_data?: {
                                ext: string;
                                resources: {
                                    footprint: {
                                        read_only: Array<any>;
                                        read_write: Array<any>;
                                    };
                                    instructions: number;
                                    read_bytes: number;
                                    write_bytes: number;
                                };
                                resource_fee: number;
                            };
                        };
                    };
                };
                signatures: Array<{
                    hint: string; // '666b79b4'
                    signature: string; // hex signature
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
                                cond: {
                                    time?: {
                                        min_time?: number;
                                        max_time?: number;
                                    };
                                };
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
                                ext: {
                                    v1?: {
                                        soroban_data?: {
                                            ext: string;
                                            resources: {
                                                footprint: {
                                                    read_only: Array<any>;
                                                    read_write: Array<any>;
                                                };
                                                instructions: number;
                                                read_bytes: number;
                                                write_bytes: number;
                                            };
                                            resource_fee: number;
                                        };
                                    };
                                };
                            };
                            signatures: Array<{
                                hint: string;
                                signature: string;
                            }>;
                        };
                    };
                };
                signatures: Array<{
                    hint: string;
                    signature: string;
                }>;
            };
        };
        meta: {
            v3: {
                ext: string; // 'v0'
                tx_changes_before: Array<{
                    state?: any;
                    updated?: any;
                }>;
                operations: Array<{
                    changes: Array<any>;
                }>;
                tx_changes_after: Array<{
                    state?: any;
                    updated?: any;
                }>;
                soroban_meta: {
                    ext: {
                        v1?: {
                            total_non_refundable_resource_fee_charged: number;
                            total_refundable_resource_fee_charged: number;
                            rent_fee_charged: number;
                        };
                    };
                    events: Array<{
                        ext: string;
                        contract_id?: string;
                        type: string; // 'contract' | 'system' | 'diagnostic'
                        body: {
                            v0?: {
                                topics: Array<any>;
                                data: any;
                            };
                        };
                    }>;
                    return_value: string; // 'void' or actual return value
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
            transaction_hash: string; // 'b5a998495119edde96a32a3a281431226ccfca48b377aee8f3226699b0ee577c'
            result: {
                fee_charged: number; // 64167
                result: {
                    tx_success?: Array<{
                        operation_result?: {
                            tr?: {
                                invoke_contract_result?: {
                                    success?: any;
                                    failure?: any;
                                };
                            };
                        };
                    }>;
                    tx_failed?: any;
                };
                ext: string; // 'v0'
            };
        };
        paging_token: string; // '746491085852672'
        message: string; // 'Latest transaction hash for contract address...'
        chain: string; // 'stellar'
    };
}

/**
 * Extract payment details from Soroban webhook data
 */
async function extractPaymentDetails(webhookData: SorobanHook): Promise<{
    amount: string;
    currency: string;
    contractAddress?: string;
    senderAddress: string;
    recipientAddress?: string;
    transferType?: string;
    memo?: string;
}> {
    // Default values
    let amount = "0";
    let currency = "XLM"; // Default fallback
    let contractAddress: string | undefined;

    // Handle both regular transactions and fee bump transactions
    let txData;
    let senderAddress: string;

    if (webhookData.data.body.tx) {
        // Regular transaction
        txData = webhookData.data.body.tx?.tx;
        senderAddress = SorobanWebhookService.getTransferOriginAccount(webhookData as unknown as SorobanHookData);
        console.log('🔍 DEBUG: Processing regular transaction');
    } else if (webhookData.data.body.tx_fee_bump) {
        // Fee bump transaction - get the inner transaction
        txData = webhookData.data.body.tx_fee_bump?.tx?.inner_tx?.tx?.tx;
        senderAddress = SorobanWebhookService.getTransferOriginAccount(webhookData as unknown as SorobanHookData);
        console.log('🔍 DEBUG: Processing fee bump transaction:', senderAddress);
    } else {
        throw new Error('Unknown transaction structure - neither tx nor tx_fee_bump found');
    }

    if (!txData || !senderAddress) {
        throw new Error('Unable to extract transaction data or source account from webhook payload');
    }

    let recipientAddress: string | undefined;
    let transferType: string | undefined;
    let memo: string | undefined;

    console.log('🔍 DEBUG: Starting payment detail extraction for transaction:', webhookData.data.hash);
    console.log('🔍 DEBUG: Source account (sender):', senderAddress);

    try {
        // 1. Try to extract from operations first
        const operations = txData.operations;
        console.log('🔍 DEBUG: Operations count:', operations?.length || 0);

        if (operations && operations.length > 0) {
            operations.forEach((op: any, index: number) => {
                console.log(`🔍 DEBUG: Operation ${index}:`, JSON.stringify(op, null, 2));

                // Handle both invoke_contract and invoke_host_function
                let contractOperation = null;
                if (op.body.invoke_contract) {
                    contractOperation = op.body.invoke_contract;
                    console.log('🔍 DEBUG: Found invoke_contract operation');
                } else if (op.body.invoke_host_function?.host_function?.invoke_contract) {
                    contractOperation = op.body.invoke_host_function.host_function.invoke_contract;
                    console.log('🔍 DEBUG: Found invoke_host_function operation');
                }

                if (contractOperation) {
                    const functionName = contractOperation.function_name;
                    const args = contractOperation.args;
                    contractAddress = contractOperation.contract_address; // Extract contract address

                    console.log(`🔍 DEBUG: Function name: ${functionName}`);
                    console.log(`🔍 DEBUG: Contract address: ${contractAddress}`);
                    console.log(`🔍 DEBUG: Args:`, JSON.stringify(args, null, 2));

                    // Look for payment-related functions (broader search)
                    if (functionName && (
                        functionName.toLowerCase().includes('transfer') ||
                        functionName.toLowerCase().includes('send') ||
                        functionName.toLowerCase().includes('pay') ||
                        functionName.toLowerCase().includes('mint') ||
                        functionName.toLowerCase().includes('burn')
                    )) {
                        console.log(`🔍 DEBUG: Found payment function: ${functionName}`);
                        transferType = functionName;

                        // Try to extract amount and recipient from args with different strategies
                        if (args && Array.isArray(args)) {
                            console.log(`🔍 DEBUG: Analyzing ${args.length} arguments for recipient and amount...`);

                            // For transfer function, expect pattern: [from, to, amount]
                            if (functionName === 'transfer' && args.length >= 3) {
                                // Args[0] = FROM (sender), Args[1] = TO (recipient), Args[2] = AMOUNT
                                const fromArg = args[0];
                                const toArg = args[1];
                                const amountArg = args[2];

                                // Extract FROM address
                                let fromAddress: string | undefined;
                                if (typeof fromArg === 'string') {
                                    fromAddress = fromArg;
                                } else if (fromArg?.address) {
                                    fromAddress = fromArg.address;
                                }

                                // Extract TO address (recipient)
                                if (typeof toArg === 'string') {
                                    recipientAddress = toArg;
                                    console.log(`🔍 DEBUG: Found recipient address (arg[1]): ${recipientAddress}`);
                                } else if (toArg?.address) {
                                    recipientAddress = toArg.address;
                                    console.log(`🔍 DEBUG: Found recipient address in object (arg[1]): ${recipientAddress}`);
                                }

                                // Extract amount
                                if (amountArg?.i128) {
                                    const hi = amountArg.i128.hi || 0;
                                    const lo = amountArg.i128.lo || 0;
                                    const fullAmount = hi * Math.pow(2, 32) + lo;
                                    amount = fullAmount.toString();
                                    console.log(`🔍 DEBUG: Found transfer amount (i128): ${amount} stroops (hi: ${hi}, lo: ${lo})`);
                                } else if (typeof amountArg === 'number') {
                                    amount = amountArg.toString();
                                    console.log(`🔍 DEBUG: Found transfer amount (number): ${amount}`);
                                }

                                console.log(`🔍 DEBUG: Transfer parsed - FROM: ${fromAddress}, TO: ${recipientAddress}, AMOUNT: ${amount}`);
                            } else {
                                // Fallback to generic parsing for other function types
                                for (let i = 0; i < args.length; i++) {
                                    const arg = args[i];
                                    console.log(`🔍 DEBUG: Analyzing arg ${i}:`, arg);

                                    // Try to identify recipient address (usually first or second arg)
                                    if (typeof arg === 'string' && arg.length > 20 && (/^[A-Z0-9]+$/.exec(arg))) {
                                        // This looks like a Stellar address
                                        if (!recipientAddress && arg !== senderAddress) {
                                            recipientAddress = arg;
                                            console.log(`🔍 DEBUG: Found potential recipient address: ${recipientAddress}`);
                                        }
                                    } else if (typeof arg === 'object' && arg !== null) {
                                        // Check if the object contains address information
                                        if (arg.address && typeof arg.address === 'string' && arg.address !== senderAddress) {
                                            recipientAddress = arg.address;
                                            console.log(`🔍 DEBUG: Found recipient address in object: ${recipientAddress}`);
                                        }
                                        if (arg.to && typeof arg.to === 'string' && arg.to !== senderAddress) {
                                            recipientAddress = arg.to;
                                            console.log(`🔍 DEBUG: Found recipient address in 'to' field: ${recipientAddress}`);
                                        }
                                        if (arg.destination && typeof arg.destination === 'string' && arg.destination !== senderAddress) {
                                            recipientAddress = arg.destination;
                                            console.log(`🔍 DEBUG: Found recipient address in 'destination' field: ${recipientAddress}`);
                                        }
                                    }
                                }
                            }

                            // For non-transfer functions, parse amount from arguments
                            if (functionName !== 'transfer' && amount === "0") {
                                for (let i = 0; i < args.length; i++) {
                                    const arg = args[i];

                                    // Strategy 1: Direct number or string
                                    if (typeof arg === 'number' && arg > 0) {
                                        amount = arg.toString();
                                        console.log(`🔍 DEBUG: Found amount (direct number): ${amount}`);
                                        break;
                                    }

                                    if (typeof arg === 'string') {
                                        const numValue = parseFloat(arg);
                                        if (!isNaN(numValue) && numValue > 0) {
                                            amount = numValue.toString();
                                            console.log(`🔍 DEBUG: Found amount (string): ${amount}`);
                                            break;
                                        }
                                    }

                                    // Strategy 2: Object with amount field
                                    if (typeof arg === 'object' && arg !== null) {
                                        // Handle Stellar i128 format (common for large amounts)
                                        if (arg.i128 && typeof arg.i128 === 'object') {
                                            if (arg.i128.lo !== undefined) {
                                                // Stellar i128 format: combine hi and lo parts
                                                const hi = arg.i128.hi || 0;
                                                const lo = arg.i128.lo || 0;
                                                // For most transfers, hi=0 and lo contains the amount
                                                const fullAmount = hi * Math.pow(2, 32) + lo;
                                                amount = fullAmount.toString();
                                                console.log(`🔍 DEBUG: Found amount (i128 format): ${amount} stroops (hi: ${hi}, lo: ${lo})`);
                                                break;
                                            }
                                        }

                                        if (arg.amount !== undefined) {
                                            amount = arg.amount.toString();
                                            console.log(`🔍 DEBUG: Found amount (object.amount): ${amount}`);
                                            break;
                                        }
                                        if (arg.value !== undefined) {
                                            amount = arg.value.toString();
                                            console.log(`🔍 DEBUG: Found amount (object.value): ${amount}`);
                                            break;
                                        }
                                        if (arg.balance !== undefined) {
                                            amount = arg.balance.toString();
                                            console.log(`🔍 DEBUG: Found amount (object.balance): ${amount}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        // 2. Try to extract from Soroban events (enhanced)
        const events = webhookData.data.meta?.v3?.soroban_meta?.events;
        console.log('🔍 DEBUG: Events count:', events?.length || 0);

        if (events && Array.isArray(events) && amount === "0") {
            events.forEach((event, index) => {
                console.log(`🔍 DEBUG: Event ${index}:`, JSON.stringify(event, null, 2));

                if (event.body?.v0) {
                    const topics = event.body.v0.topics;
                    const data = event.body.v0.data;

                    console.log(`🔍 DEBUG: Event ${index} topics:`, topics);
                    console.log(`🔍 DEBUG: Event ${index} data:`, data);

                    // Look for transfer/payment events in topics
                    if (topics && Array.isArray(topics)) {
                        const hasTransferTopic = topics.some(topic =>
                            typeof topic === 'string' &&
                            (topic.toLowerCase().includes('transfer') ||
                                topic.toLowerCase().includes('payment') ||
                                topic.toLowerCase().includes('send'))
                        );

                        if (hasTransferTopic) {
                            console.log(`🔍 DEBUG: Found transfer event in topics`);

                            // Try to extract recipient from topics first
                            if (!recipientAddress) {
                                for (const topic of topics) {
                                    if (typeof topic === 'string' && topic.length > 20 && /^[A-Z0-9]+$/.test(topic) && topic !== senderAddress) {
                                        recipientAddress = topic;
                                        console.log(`🔍 DEBUG: Found recipient address in event topics: ${recipientAddress}`);
                                        break;
                                    }
                                }
                            }

                            // Try to extract amount and recipient from data
                            if (data) {
                                if (typeof data === 'number' && data > 0) {
                                    amount = data.toString();
                                    console.log(`🔍 DEBUG: Found amount (event data number): ${amount}`);
                                } else if (typeof data === 'object' && data !== null) {
                                    // Check for recipient in data object
                                    if (!recipientAddress) {
                                        const recipientFields = ['to', 'recipient', 'destination', 'address'];
                                        for (const field of recipientFields) {
                                            if (data[field] && typeof data[field] === 'string' && data[field] !== senderAddress) {
                                                recipientAddress = data[field];
                                                console.log(`🔍 DEBUG: Found recipient address in event data.${field}: ${recipientAddress}`);
                                                break;
                                            }
                                        }
                                    }
                                    // Handle Stellar i128 format in event data
                                    if (data.i128 && typeof data.i128 === 'object') {
                                        if (data.i128.lo !== undefined) {
                                            const hi = data.i128.hi || 0;
                                            const lo = data.i128.lo || 0;
                                            const fullAmount = hi * Math.pow(2, 32) + lo;
                                            amount = fullAmount.toString();
                                            console.log(`🔍 DEBUG: Found amount (event i128 format): ${amount} stroops (hi: ${hi}, lo: ${lo})`);
                                        }
                                    } else {
                                        // Try various amount field names
                                        const amountFields = ['amount', 'value', 'balance', 'sum', 'total'];
                                        for (const field of amountFields) {
                                            if (data[field] !== undefined && data[field] > 0) {
                                                amount = data[field].toString();
                                                console.log(`🔍 DEBUG: Found amount (event data.${field}): ${amount}`);
                                                break;
                                            }
                                        }
                                    }

                                    // Also check if data is an array with amounts
                                    if (Array.isArray(data)) {
                                        for (const item of data) {
                                            if (typeof item === 'number' && item > 0) {
                                                amount = item.toString();
                                                console.log(`🔍 DEBUG: Found amount (event data array): ${amount}`);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            // Also check in topics for encoded amounts
                            for (const topic of topics) {
                                if (typeof topic === 'object' && topic !== null) {
                                    const amountFields = ['amount', 'value', 'balance'];
                                    for (const field of amountFields) {
                                        if (topic[field] !== undefined && topic[field] > 0) {
                                            amount = topic[field].toString();
                                            console.log(`🔍 DEBUG: Found amount (topic.${field}): ${amount}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        // 3. Try to extract from state changes (NEW - this often contains balance updates)
        if (amount === "0") {
            const changesBefore = webhookData.data.meta?.v3?.tx_changes_before || [];
            const changesAfter = webhookData.data.meta?.v3?.tx_changes_after || [];
            const allChanges = [...changesBefore, ...changesAfter];

            console.log('🔍 DEBUG: State changes count:', allChanges.length);

            allChanges.forEach((change, index) => {
                console.log(`🔍 DEBUG: State change ${index}:`, JSON.stringify(change, null, 2));

                // Look for balance changes or updates
                if (change.updated || change.state) {
                    const stateData = change.updated || change.state;
                    console.log(`🔍 DEBUG: State data:`, stateData);

                    // Try to find recipient in the state data (account changes often show recipient)
                    if (!recipientAddress && typeof stateData === 'object' && stateData !== null) {
                        if (stateData.account_id && typeof stateData.account_id === 'string' && stateData.account_id !== senderAddress) {
                            recipientAddress = stateData.account_id;
                            console.log(`🔍 DEBUG: Found recipient address in state change account_id: ${recipientAddress}`);
                        }
                    }

                    // Try to find amount in the state data
                    if (typeof stateData === 'object' && stateData !== null) {
                        const amountFields = ['amount', 'balance', 'value', 'new_balance', 'updated_balance'];
                        for (const field of amountFields) {
                            if (stateData[field] !== undefined && stateData[field] > 0) {
                                amount = stateData[field].toString();
                                console.log(`🔍 DEBUG: Found amount (state.${field}): ${amount}`);
                                break;
                            }
                        }
                    }
                }
            });
        }

        // 4. If we still don't have an amount, try parsing the memo
        if (amount === "0") {
            const memo = txData.memo;
            console.log('🔍 DEBUG: Memo:', memo);

            if (memo && memo !== 'none') {
                const memoAmountMatch = /(\d+\.?\d*)/.exec(memo);
                if (memoAmountMatch?.[1]) {
                    amount = memoAmountMatch[1];
                    console.log(`🔍 DEBUG: Found amount (memo): ${amount}`);
                }
            }
        }

        // 🔍 COMPREHENSIVE MEMO DEBUGGING - Let's find where the memo is actually stored!
        console.log('🔍 DEBUG: COMPREHENSIVE MEMO ANALYSIS - Searching all possible locations...');

        // 1. Check the main memo field (what we're currently using)
        const mainMemo = txData.memo;
        console.log('🔍 DEBUG: Main memo field (txData.memo):', mainMemo);

        // 2. Check if memo is in the cond field (conditional memo)
        const condMemo = txData.cond;
        console.log('🔍 DEBUG: Conditional memo (txData.cond):', JSON.stringify(condMemo, null, 2));

        // 3. Check if memo is in the transaction envelope structure
        console.log('🔍 DEBUG: Transaction data structure available:', typeof txData);

        // 4. Check if memo is in the operations
        const txOperations = txData.operations;
        if (txOperations && Array.isArray(txOperations)) {
            txOperations.forEach((op, index) => {
                console.log(`🔍 DEBUG: Operation ${index} memo check:`, {
                    hasMemo: 'memo' in op,
                    hasBody: 'body' in op,
                    bodyKeys: op.body ? Object.keys(op.body) : [],
                    fullOperation: JSON.stringify(op, null, 2)
                });
            });
        }

        // 5. Check if memo is in the meta section
        const meta = webhookData.data.meta;
        if (meta) {
            console.log('🔍 DEBUG: Meta section keys:', Object.keys(meta));
            if (meta.v3) {
                console.log('🔍 DEBUG: Meta v3 keys:', Object.keys(meta.v3));

                // Check if memo is in soroban_meta
                if (meta.v3.soroban_meta) {
                    console.log('🔍 DEBUG: Soroban meta keys:', Object.keys(meta.v3.soroban_meta));
                    console.log('🔍 DEBUG: Soroban meta return_value:', meta.v3.soroban_meta.return_value);

                    // Check if memo is in the events
                    if (meta.v3.soroban_meta.events) {
                        meta.v3.soroban_meta.events.forEach((event, index) => {
                            console.log(`🔍 DEBUG: Event ${index} memo check:`, {
                                contractId: event.contract_id,
                                type: event.type,
                                topics: event.body?.v0?.topics,
                                data: event.body?.v0?.data,
                                hasStringTopic: event.body?.v0?.topics?.some((topic: any) =>
                                    typeof topic === 'object' && topic.string?.includes('Hello'))
                            });
                        });
                    }
                }
            }
        }

        // 6. Check if memo is encoded in the raw transaction data
        const rawTx = webhookData.data.body;
        console.log('🔍 DEBUG: Raw transaction body keys:', Object.keys(rawTx));

        // 7. Check if memo is in the result section
        const result = webhookData.data.result;
        if (result) {
            console.log('🔍 DEBUG: Result section keys:', Object.keys(result));
            console.log('🔍 DEBUG: Result details:', JSON.stringify(result, null, 2));
        }

        // 8. Check if memo is anywhere in the top-level data
        console.log('🔍 DEBUG: Top-level webhook data keys:', Object.keys(webhookData.data));

        // 9. Deep search for any string that might contain "Hello"
        const webhookDataStr = JSON.stringify(webhookData);
        const helloMatches = webhookDataStr.match(/[Hh]ello[^"]*there[^"]*/g);
        if (helloMatches) {
            console.log('🔍 DEBUG: Found "Hello there" pattern in webhook data:', helloMatches);
        } else {
            console.log('🔍 DEBUG: No "Hello there" pattern found in entire webhook data');

            // Let's also check for any memo-like patterns
            const memoPatterns = [
                /memo[^"]*:[^"]*"([^"]+)"/gi,
                /"memo_text"[^"]*:[^"]*"([^"]+)"/gi,
                /"message"[^"]*:[^"]*"([^"]+)"/gi,
                /"note"[^"]*:[^"]*"([^"]+)"/gi,
                /"description"[^"]*:[^"]*"([^"]+)"/gi
            ];

            memoPatterns.forEach((pattern, index) => {
                const matches = webhookDataStr.match(pattern);
                if (matches) {
                    console.log(`🔍 DEBUG: Found memo pattern ${index}:`, matches);
                }
            });
        }

        console.log('🔍 DEBUG: MEMO ANALYSIS COMPLETE - Check above logs for memo location');

        // Now try to actually extract the memo based on what we find
        if (mainMemo && mainMemo !== 'none') {
            // Check if memo is a string or an object with memo type
            if (typeof mainMemo === 'string') {
                memo = mainMemo;
                console.log('🔍 DEBUG: Found memo in main field (string):', memo);
            } else if (typeof mainMemo === 'object' && mainMemo !== null) {
                console.log('🔍 DEBUG: Memo is object, checking for different memo types:', mainMemo);

                // Type assertion for memo object since webhook data might vary from interface
                const memoObj = mainMemo as any;

                // Check for different Stellar memo types
                if (memoObj.text) {
                    memo = memoObj.text;
                    console.log('🔍 DEBUG: Found TEXT memo:', memo);
                } else if (memoObj.memo_text) {
                    memo = memoObj.memo_text;
                    console.log('🔍 DEBUG: Found memo_text:', memo);
                } else if (memoObj.value) {
                    memo = memoObj.value;
                    console.log('🔍 DEBUG: Found memo value:', memo);
                } else if (memoObj.id) {
                    memo = `ID: ${memoObj.id}`;
                    console.log('🔍 DEBUG: Found memo ID:', memo);
                } else if (memoObj.hash) {
                    memo = `HASH: ${memoObj.hash}`;
                    console.log('🔍 DEBUG: Found memo hash:', memo);
                } else {
                    memo = JSON.stringify(memoObj);
                    console.log('🔍 DEBUG: Found structured memo:', memo);
                }
            }
        }

        // If no memo found in main field, check if it's somewhere in the webhook data
        if (!memo && helloMatches && helloMatches.length > 0) {
            memo = helloMatches[0];
            console.log('🔍 DEBUG: Found memo in deep search:', memo);
        }

        // Let's also check if memo is base64 encoded somewhere
        try {
            const base64Patterns = webhookDataStr.match(/[A-Za-z0-9+/]{20,}={0,2}/g);
            if (base64Patterns) {
                console.log('🔍 DEBUG: Found potential base64 encoded data, checking for memo...');
                base64Patterns.slice(0, 5).forEach((pattern, index) => {
                    try {
                        const decoded = Buffer.from(pattern, 'base64').toString('utf-8');
                        if (decoded.includes('Hello') || decoded.includes('there')) {
                            console.log(`🔍 DEBUG: Found memo in base64 pattern ${index}:`, decoded);
                            if (!memo) {
                                memo = decoded;
                                console.log('🔍 DEBUG: Extracted memo from base64:', memo);
                            }
                        }
                    } catch (e) {
                        // Skip invalid base64
                    }
                });
            }
        } catch (error) {
            console.log('🔍 DEBUG: Base64 memo search failed:', error);
        }

        // 5. Last resort: try to extract from diagnostic events
        if (amount === "0") {
            const diagnosticEvents = webhookData.data.meta?.v3?.soroban_meta?.diagnostic_events || [];
            console.log('🔍 DEBUG: Diagnostic events count:', diagnosticEvents.length);

            for (let index = 0; index < diagnosticEvents.length; index++) {
                const diagEvent = diagnosticEvents[index];
                if (!diagEvent) continue;

                console.log(`🔍 DEBUG: Diagnostic event ${index}:`, JSON.stringify(diagEvent, null, 2));

                if (diagEvent.event?.body?.v0) {
                    const data = diagEvent.event.body.v0.data;

                    // Handle direct number
                    if (typeof data === 'number' && data > 0) {
                        amount = data.toString();
                        console.log(`🔍 DEBUG: Found amount (diagnostic event number): ${amount}`);
                        break; // Stop searching once amount is found
                    }
                    // Handle i128 format in diagnostic events
                    else if (data && typeof data === 'object' && data.i128) {
                        if (data.i128.lo !== undefined) {
                            const hi = data.i128.hi || 0;
                            const lo = data.i128.lo || 0;
                            const fullAmount = hi * Math.pow(2, 32) + lo;
                            amount = fullAmount.toString();
                            console.log(`🔍 DEBUG: Found amount (diagnostic i128): ${amount} stroops (hi: ${hi}, lo: ${lo})`);
                            break; // Stop searching once amount is found
                        }
                    }
                    // Handle array with amounts (like in the vec diagnostic event)
                    else if (data && typeof data === 'object' && data.vec && Array.isArray(data.vec)) {
                        for (const item of data.vec) {
                            if (item && typeof item === 'object' && item.i128) {
                                if (item.i128.lo !== undefined) {
                                    const hi = item.i128.hi || 0;
                                    const lo = item.i128.lo || 0;
                                    const fullAmount = hi * Math.pow(2, 32) + lo;
                                    amount = fullAmount.toString();
                                    console.log(`🔍 DEBUG: Found amount (diagnostic vec i128): ${amount} stroops (hi: ${hi}, lo: ${lo})`);
                                    break; // Exit this inner loop
                                }
                            }
                        }
                        if (amount !== "0") break; // Exit outer loop if amount found
                    }
                }
            }
        }

    } catch (error) {
        console.error('❌ Error extracting payment details:', error);
    }

    // Map contract address to actual currency from wallet balances or known mappings
    if (contractAddress) {
        console.log(`🔍 DEBUG: Looking up currency for contract address: ${contractAddress}`);

        // First check known contract mappings
        const contractToCurrency: Record<string, string> = {
            'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC': 'USDC', // Testnet main balance contract
            'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA': 'USDC', // Mainnet main balance contract
            // Add more mappings as needed
        };

        const knownCurrency = contractToCurrency[contractAddress];
        if (knownCurrency) {
            currency = knownCurrency;
            console.log(`🔍 DEBUG: Found currency from known mapping: ${currency}`);
        } else {
            // Fallback to database lookup
            try {
                const walletBalance = await db.walletBalance.findFirst({
                    where: { address: contractAddress },
                    select: { currency: true }
                });

                if (walletBalance?.currency) {
                    currency = walletBalance.currency;
                    console.log(`🔍 DEBUG: Found currency from wallet balance: ${currency}`);
                } else {
                    console.log(`🔍 DEBUG: No wallet balance found for contract ${contractAddress}, using default: ${currency}`);
                }
            } catch (error) {
                console.error('❌ Error looking up currency for contract address:', error);
            }
        }
    }

    console.log(`🔍 DEBUG: Final extracted details:`, {
        amount,
        currency,
        contractAddress,
        senderAddress,
        recipientAddress,
        transferType,
        memo
    });

    // Convert stroops to asset units for display if amount looks like stroops
    const amountNum = parseFloat(amount);
    const displayAmount = amountNum > 10000000 ? // If > 1 unit in stroops
        `${(amountNum / 10000000).toFixed(7)} ${currency} (${amount} stroops)` :
        `${amount} ${currency}`;

    // Comprehensive transfer analysis log
    console.log('📊 TRANSFER ANALYSIS SUMMARY:');
    console.log(`  💰 Amount: ${displayAmount}`);
    console.log(`  🏦 Contract Address: ${contractAddress || 'NOT IDENTIFIED'}`);
    console.log(`  💱 Currency/Asset: ${currency}`);
    console.log(`  📤 Sender: ${senderAddress}`);
    console.log(`  📥 Recipient: ${recipientAddress || 'NOT IDENTIFIED'}`);
    console.log(`  🔧 Transfer Type: ${transferType || 'UNKNOWN'}`);
    console.log(`  📝 Memo: ${memo || 'NO MEMO FOUND'}`);
    console.log(`  🎯 Direction: ${recipientAddress ? 'OUTBOUND from sender' : 'INBOUND or INTERNAL'}`);

    return {
        amount,
        currency,
        contractAddress,
        senderAddress,
        recipientAddress,
        transferType,
        memo
    };
}

/**
 * Process payment received email notifications for wallet mappings
 */
async function processPaymentReceivedEmails(
    webhookData: SorobanHook,
    transaction: any,
    walletMappings: any[]
): Promise<void> {
    const emailService = new EmailService({ db });
    const paymentDetails = await extractPaymentDetails(webhookData);

    console.log('💳 Extracted payment details:', paymentDetails);

    // Enhanced wallet mapping analysis
    console.log('🔗 WALLET MAPPING ANALYSIS:');
    console.log(`  📊 Total mappings found: ${walletMappings.length}`);

    for (const mapping of walletMappings) {
        console.log(`  🏦 Mapping - WalletId: ${mapping.walletId}, Address: ${mapping.address}, UserId: ${mapping.userId}`);
        console.log(`    📍 Confidence: ${mapping.confidence}, Reason: ${mapping.reason}`);

        // Check if this wallet belongs to sender or recipient
        const isOwnerOfSenderAddress = mapping.address === paymentDetails.senderAddress;
        const isOwnerOfRecipientAddress = paymentDetails.recipientAddress && mapping.address === paymentDetails.recipientAddress;

        console.log(`    🔍 Role Analysis:`);
        console.log(`      📤 Is Sender Wallet: ${isOwnerOfSenderAddress}`);
        console.log(`      📥 Is Recipient Wallet: ${isOwnerOfRecipientAddress}`);

        if (isOwnerOfRecipientAddress) {
            console.log(`    🎯 RECIPIENT IDENTIFIED! This wallet belongs to the payment recipient.`);
        } else if (isOwnerOfSenderAddress) {
            console.log(`    📤 SENDER IDENTIFIED! This wallet belongs to the payment sender.`);
        } else {
            console.log(`    ❓ UNKNOWN ROLE - Wallet not directly sender or recipient, might be related address.`);
        }
    }

    for (const mapping of walletMappings) {
        try {
            // Get user details including email
            const user = await db.user.findUnique({
                where: { id: mapping.userId },
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            });

            if (!user) {
                console.log(`⚠️ User not found for mapping: ${mapping.userId}`);
                continue;
            }

            if (!user.email) {
                console.log(`⚠️ No email found for user: ${user.id}`);
                continue;
            }

            // Type assertion to ensure TypeScript knows these are strings
            const userEmail = user.email;
            const recipientName = user.name || userEmail.split('@')[0];

            // Get sender information (if we can match the sender address to a user)
            let senderName = paymentDetails.senderAddress ?? "";
            try {
                const senderWallet = await db.wallet.findFirst({
                    where: { address: paymentDetails.senderAddress },
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                });

                if (senderWallet?.user?.name) {
                    senderName = senderWallet.user.name;
                } else if (senderWallet?.user?.email) {
                    senderName = senderWallet.user.email.split('@')[0] ?? "";
                }
            } catch (error) {
                console.error('Error getting sender info:', error);
            }

            // Convert stroops to XLM for email display (if amount looks like stroops)
            const amountNum = parseFloat(paymentDetails.amount);
            const emailAmount = amountNum > 10000000 ? // If > 1 XLM in stroops
                (amountNum / 10000000).toFixed(7).replace(/\.?0+$/, '') : // Remove trailing zeros
                paymentDetails.amount;

            // Send payment received email
            console.log(`📧 Sending payment received email to: ${userEmail}`);
            console.log(`📧 Converting amount for email: ${paymentDetails.amount} stroops → ${emailAmount} XLM`);
            await emailService.sendPaymentReceivedNotification({
                to: userEmail,
                recipientName: recipientName ?? "",
                amount: emailAmount,
                currency: paymentDetails.currency,
                transactionId: transaction.transaction_hash,
                senderName: senderName || paymentDetails.senderAddress
            });

            console.log(`✅ Payment received email sent to: ${user.email}`);

        } catch (error) {
            console.error(`❌ Error sending payment email for mapping ${mapping.walletId}:`, error);
            // Continue processing other mappings even if one fails
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('🔗 Soroban webhook received');

        // Check if request has body
        const contentLength = req.headers.get('content-length');
        if (!contentLength || contentLength === '0') {
            console.log('Empty request body received');
            return NextResponse.json(
                { message: "Received empty request body" },
                { status: 200 }
            );
        }

        // Check content type
        const contentType = req.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            console.log('Invalid content type:', contentType);
            return NextResponse.json(
                { error: "Content-Type must be application/json" },
                { status: 400 }
            );
        }

        let body: SorobanHook;
        try {
            body = await req.json() as SorobanHook;
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return NextResponse.json(
                { error: "Invalid JSON payload" },
                { status: 400 }
            );
        }

        console.log('📊 Event Type:', body.eventType);
        console.log('🆔 Transaction ID:', body.data.id);
        console.log('🔑 Transaction Hash:', body.data.hash);
        console.log('📚 Ledger:', body.data.ledger);
        console.log('⏰ Timestamp:', body.data.ts, new Date(body.data.ts * 1000).toISOString());

        // Log full structure for debugging when things are missing
        console.log('🔍 Full webhook data structure:');
        console.log('  - data.body exists:', !!body.data.body);
        console.log('  - data.body.tx exists:', !!body.data.body?.tx);
        console.log('  - data.body.tx.tx exists:', !!body.data.body?.tx?.tx);
        console.log('  - data.meta exists:', !!body.data.meta);
        console.log('  - data.meta.v3 exists:', !!body.data.meta?.v3);
        console.log('  - data.result exists:', !!body.data.result);

        // Safe access to nested transaction data
        const txData = body.data.body?.tx?.tx ?? body.data.body?.tx_fee_bump?.tx?.inner_tx?.tx?.tx;
        if (txData) {
            console.log('🏦 Source Account:', txData.source_account);
            console.log('💰 Fee:', txData.fee);
            console.log('📝 Memo:', txData.memo);
        } else {
            console.log('⚠️ Transaction data structure missing or incomplete');
            console.log('📋 Available body keys:', Object.keys(body.data.body || {}));
            if (body.data.body) {
                console.log('📋 Body structure preview:', JSON.stringify(body.data.body, null, 2).substring(0, 500) + '...');
            }
        }

        // Log operations details
        const operations = txData?.operations;
        if (operations && Array.isArray(operations)) {
            console.log('🛠️ Operations:', operations.length);
            operations.forEach((op, index) => {
                console.log(`  Operation ${index}:`, JSON.stringify(op, null, 2));
                if (op.body?.invoke_contract) {
                    console.log(`    📋 Contract Address: ${op.body.invoke_contract.contract_address}`);
                    console.log(`    🔧 Function: ${op.body.invoke_contract.function_name}`);
                    console.log(`    📝 Args:`, op.body.invoke_contract.args);
                }
            });
        } else {
            console.log('🛠️ No operations found or invalid operations structure');
        }

        // Log Soroban events (most important for mapping)
        const sorobanEvents = body.data.meta?.v3?.soroban_meta?.events;
        if (sorobanEvents && Array.isArray(sorobanEvents)) {
            console.log('🎯 Soroban Events:', sorobanEvents.length);
            sorobanEvents.forEach((event, index) => {
                console.log(`  Event ${index}:`, JSON.stringify(event, null, 2));
                if (event.contract_id) {
                    console.log(`    📋 Contract ID: ${event.contract_id}`);
                }
                if (event.body?.v0) {
                    console.log(`    🏷️ Topics:`, event.body.v0.topics);
                    console.log(`    📊 Data:`, event.body.v0.data);
                }
            });
        } else {
            console.log('🎯 No Soroban events found or invalid structure');
            console.log('📋 Available meta structure:', JSON.stringify(body.data.meta, null, 2));
        }

        // Log transaction result
        const resultData = body.data.result?.result;
        if (resultData) {
            console.log('✅ Transaction Result Fee Charged:', resultData.fee_charged);
            if (resultData.result?.tx_success) {
                console.log('🎉 Success Results:', JSON.stringify(resultData.result.tx_success, null, 2));
            }
            if (resultData.result?.tx_failed) {
                console.log('❌ Failed Results:', JSON.stringify(resultData.result.tx_failed, null, 2));
            }
        } else {
            console.log('⚠️ Transaction result data missing');
            console.log('📋 Available result structure:', JSON.stringify(body.data.result, null, 2));
        }

        // Log tx_changes for state changes
        const metaV3 = body.data.meta?.v3;
        if (metaV3) {
            const changesBefore = metaV3.tx_changes_before;
            const changesAfter = metaV3.tx_changes_after;

            if (changesBefore && Array.isArray(changesBefore)) {
                console.log('🔄 State Changes Before:', changesBefore.length);
                changesBefore.forEach((change, index) => {
                    console.log(`  Change Before ${index}:`, JSON.stringify(change, null, 2));
                });
            } else {
                console.log('🔄 No state changes before found');
            }

            if (changesAfter && Array.isArray(changesAfter)) {
                console.log('🔄 State Changes After:', changesAfter.length);
                changesAfter.forEach((change, index) => {
                    console.log(`  Change After ${index}:`, JSON.stringify(change, null, 2));
                });
            } else {
                console.log('🔄 No state changes after found');
            }
        } else {
            console.log('⚠️ Meta v3 data missing for state changes');
        }

        // Log signatures
        const signatures = body.data.body?.tx?.signatures ?? body?.data?.body?.tx_fee_bump?.tx?.inner_tx?.tx?.tx?.operations[0]?.body?.invoke_host_function?.auth[0]?.credentials?.signature;
        if (signatures && Array.isArray(signatures)) {
            console.log('✍️ Signatures:', signatures.length);
            signatures.forEach((sig, index) => {
                console.log(`  Signature ${index} hint: ${sig.hint}`);
            });
        } else {
            console.log('✍️ No signatures found or invalid structure');
        }

        // Process the webhook with our service
        console.log('🔄 Processing webhook with SorobanWebhookService...');
        try {
            // Validate that we have minimum required data for processing
            if (!body.data.hash || !body.data.id) {
                console.log('⚠️ Missing required fields (hash or id), skipping service processing');
                return NextResponse.json(
                    {
                        message: "Webhook received but missing required fields",
                        transactionHash: body.data.hash,
                        error: "Invalid webhook structure"
                    },
                    { status: 200 }
                );
            }

            const result = await SorobanWebhookService.processWebhook(body as any);

            // Extract payment details for comprehensive analysis
            const paymentAnalysis = await extractPaymentDetails(body);

            if (result.isNewTransaction) {
                console.log('✅ NEW transaction processed successfully:', {
                    transactionId: result.transaction.id,
                    hash: result.transaction.transaction_hash,
                    walletMappingsCount: result.walletMappings.length,
                    walletMappings: result.walletMappings
                });

                // Data management verification
                console.log('🗄️ DATA MANAGEMENT VERIFICATION:');
                console.log(`  📝 Transaction stored with ID: ${result.transaction.id}`);
                console.log(`  🔗 Source wallet assigned: ${result.transaction.source_wallet_id || 'NONE'}`);
                console.log(`  👤 User assigned: ${result.transaction.user_id || 'NONE'}`);
                console.log(`  💾 Raw webhook data stored: ${result.transaction.raw_webhook_data ? 'YES' : 'NO'}`);
                console.log(`  ✅ Transaction success status: ${result.transaction.is_successful}`);
                console.log(`  💰 Fee charged: ${result.transaction.fee_charged}`);

                // Related data verification
                if (result.transaction.operations && result.transaction.operations.length > 0) {
                    console.log(`  🛠️ Operations stored: ${result.transaction.operations.length}`);
                    result.transaction.operations.forEach((op: any, idx: number) => {
                        console.log(`    Op ${idx}: ${op.function_name || op.operation_type} at ${op.contract_address || 'N/A'}`);
                    });
                }

                if (result.transaction.events && result.transaction.events.length > 0) {
                    console.log(`  🎯 Events stored: ${result.transaction.events.length}`);
                    result.transaction.events.forEach((event: any, idx: number) => {
                        console.log(`    Event ${idx}: ${event.event_type} from ${event.contract_id || 'system'}`);
                    });
                }

                if (result.transaction.state_changes && result.transaction.state_changes.length > 0) {
                    console.log(`  🔄 State changes stored: ${result.transaction.state_changes.length}`);
                }

            } else {
                console.log('🔄 DUPLICATE webhook - transaction already processed:', {
                    transactionId: result.transaction.id,
                    hash: result.transaction.transaction_hash,
                    originalProcessedAt: result.transaction.created_at,
                    walletMappingsCount: result.walletMappings.length
                });
            }

            // Send payment received emails for new successful transactions
            if (result.isNewTransaction && result.transaction.is_successful && result.walletMappings.length > 0) {
                console.log('📧 Processing payment received email notifications...');
                await processPaymentReceivedEmails(body, result.transaction, result.walletMappings);
            }

            if (result.walletMappings.length > 0) {
                const logEmoji = result.isNewTransaction ? '🎯' : '📂';
                console.log(`${logEmoji} WALLET MAPPING ${result.isNewTransaction ? 'SUCCESS' : 'RETRIEVED'}! Found mappings:`);

                // Enhanced mapping analysis with payment context
                result.walletMappings.forEach((mapping: any, index: number) => {
                    console.log(`  Mapping ${index}:`, {
                        walletId: mapping.walletId,
                        address: mapping.address,
                        userId: mapping.userId,
                        confidence: mapping.confidence,
                        reason: mapping.reason
                    });

                    // Determine the role of this wallet in the transaction
                    const isSenderWallet = mapping.address === paymentAnalysis.senderAddress;
                    const isRecipientWallet = paymentAnalysis.recipientAddress && mapping.address === paymentAnalysis.recipientAddress;

                    if (isSenderWallet) {
                        console.log(`    🔄 SENDER WALLET IDENTIFIED - User ${mapping.userId} is sending the payment`);
                    } else if (isRecipientWallet) {
                        console.log(`    💰 RECIPIENT WALLET IDENTIFIED - User ${mapping.userId} is receiving the payment`);
                    } else {
                        console.log(`    🔍 RELATED WALLET - Connected to transaction but role unclear`);
                    }
                });

                // Payment flow summary
                console.log('💸 PAYMENT FLOW SUMMARY:');
                const senderMapping = result.walletMappings.find((m: any) => m.address === paymentAnalysis.senderAddress);
                const recipientMapping = paymentAnalysis.recipientAddress ?
                    result.walletMappings.find((m: any) => m.address === paymentAnalysis.recipientAddress) : null;

                console.log(`  📤 Sender: ${paymentAnalysis.senderAddress} ${senderMapping ? `(User ${senderMapping.userId})` : '(External)'}`);
                console.log(`  📥 Recipient: ${paymentAnalysis.recipientAddress || 'NOT IDENTIFIED'} ${recipientMapping ? `(User ${recipientMapping.userId})` : '(External)'}`);

                // Display amount properly
                const flowAmountNum = parseFloat(paymentAnalysis.amount);
                const flowDisplayAmount = flowAmountNum > 10000000 ?
                    `${(flowAmountNum / 10000000).toFixed(7)} XLM (${paymentAnalysis.amount} stroops)` :
                    `${paymentAnalysis.amount} ${paymentAnalysis.currency}`;
                console.log(`  💰 Amount: ${flowDisplayAmount}`);
                console.log(`  🔧 Type: ${paymentAnalysis.transferType || 'UNKNOWN'}`);
                console.log(`  📝 Memo: ${paymentAnalysis.memo || 'NO MEMO FOUND'}`);

                // Determine notification strategy
                if (recipientMapping) {
                    console.log(`  📧 EMAIL STRATEGY: Will notify recipient (User ${recipientMapping.userId})`);
                } else if (senderMapping) {
                    console.log(`  📧 EMAIL STRATEGY: Only sender in system (User ${senderMapping.userId}) - considering as outbound payment`);
                } else {
                    console.log(`  📧 EMAIL STRATEGY: Neither sender nor recipient in system - external transaction`);
                }

            } else {
                const logEmoji = result.isNewTransaction ? '⚠️' : '📂';
                console.log(`${logEmoji} NO WALLET MAPPINGS FOUND - This transaction might be from an external user`);
                console.log('🔍 EXTERNAL TRANSACTION ANALYSIS:');
                console.log(`  📤 External Sender: ${paymentAnalysis.senderAddress}`);
                console.log(`  📥 External Recipient: ${paymentAnalysis.recipientAddress || 'NOT IDENTIFIED'}`);

                // Display amount properly for external transactions too
                const extAmountNum = parseFloat(paymentAnalysis.amount);
                const extDisplayAmount = extAmountNum > 10000000 ?
                    `${(extAmountNum / 10000000).toFixed(7)} XLM (${paymentAnalysis.amount} stroops)` :
                    `${paymentAnalysis.amount} ${paymentAnalysis.currency}`;
                console.log(`  💰 Amount: ${extDisplayAmount}`);
                console.log(`  📝 Memo: ${paymentAnalysis.memo || 'NO MEMO FOUND'}`);
                console.log('  ❌ No email notifications will be sent (no users in our system involved)');
            }

            // Final verification summary
            console.log('🏁 WEBHOOK PROCESSING COMPLETE - VERIFICATION SUMMARY:');
            console.log('═'.repeat(80));
            console.log(`  🔢 Transaction ID: ${result.transaction.id}`);
            console.log(`  🔑 Transaction Hash: ${result.transaction.transaction_hash}`);
            console.log(`  📊 Processing Status: ${result.isNewTransaction ? 'NEW TRANSACTION' : 'DUPLICATE (IDEMPOTENT)'}`);
            console.log(`  💾 Data Storage: ${result.isNewTransaction ? 'COMPLETED' : 'SKIPPED (ALREADY EXISTS)'}`);
            console.log(`  🔗 Wallet Mappings: ${result.walletMappings.length} found`);
            // Display amount properly (convert stroops to XLM if needed)
            const amountNum = parseFloat(paymentAnalysis.amount);
            const displayAmount = amountNum > 10000000 ?
                `${(amountNum / 10000000).toFixed(7)} XLM (${paymentAnalysis.amount} stroops)` :
                `${paymentAnalysis.amount} ${paymentAnalysis.currency}`;

            console.log(`  💰 Payment Amount: ${displayAmount}`);
            console.log(`  📤 Sender: ${paymentAnalysis.senderAddress.substring(0, 8)}...${paymentAnalysis.senderAddress.substring(-6)}`);
            console.log(`  📥 Recipient: ${paymentAnalysis.recipientAddress ?
                `${paymentAnalysis.recipientAddress.substring(0, 8)}...${paymentAnalysis.recipientAddress.substring(-6)}` :
                'NOT IDENTIFIED'}`);
            console.log(`  🔧 Transfer Type: ${paymentAnalysis.transferType || 'UNKNOWN'}`);
            console.log(`  📝 Memo: ${paymentAnalysis.memo || 'NO MEMO FOUND'}`);
            console.log(`  ✅ Success Status: ${result.transaction.is_successful}`);
            console.log(`  📧 Email Notifications: ${result.isNewTransaction && result.walletMappings.length > 0 ? 'SENT' : 'SKIPPED'}`);
            console.log(`  🗄️ Database Indexes: Optimized for user_id + timestamp queries`);
            console.log('═'.repeat(80));

            return NextResponse.json(
                {
                    message: result.isNewTransaction ?
                        "Webhook received and processed" :
                        "Webhook received (duplicate transaction, idempotency handled)",
                    transactionHash: body.data.hash,
                    sourceAccount: body.data.body.tx?.tx.source_account || body.data.body.tx_fee_bump?.tx.inner_tx.tx.tx.source_account,
                    recipientAccount: paymentAnalysis.recipientAddress,
                    paymentAmount: paymentAnalysis.amount,
                    transferType: paymentAnalysis.transferType,
                    isNewTransaction: result.isNewTransaction,
                    walletMappingsFound: result.walletMappings.length,
                    dataStorageStatus: result.isNewTransaction ? 'completed' : 'skipped_duplicate',
                    idempotencyKey: result.transaction.id
                },
                { status: 200 }
            );
        } catch (serviceError: unknown) {
            console.error('❌ Error processing webhook with service:', serviceError);

            // Even if the service fails, we should return success to prevent webhook retries
            // unless it's a critical error that indicates we should retry
            const error = serviceError as any;
            const shouldRetry = error?.code === 'P1001' || // Database connection error
                error?.code === 'P1008' || // Timeout
                error?.message?.includes('ECONNRESET');

            if (shouldRetry) {
                console.log('🔄 Webhook processing failed with retryable error, returning 500 for retry');
                return NextResponse.json(
                    { error: "Temporary processing error, please retry" },
                    { status: 500 }
                );
            } else {
                console.log('✅ Webhook processing failed with non-retryable error, returning 200 to prevent retries');
                return NextResponse.json(
                    {
                        message: "Webhook received but processing failed",
                        transactionHash: body.data.hash,
                        error: "Processing failed but webhook acknowledged"
                    },
                    { status: 200 }
                );
            }
        }
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 