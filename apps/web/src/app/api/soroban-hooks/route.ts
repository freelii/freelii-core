import { NextResponse, type NextRequest } from "next/server";
import { SorobanWebhookService } from "../../../server/services/soroban/soroban-webhook-service";

interface SorobanHook {
    eventType: 'get_contract_transaction';
    data: {
        id: string; // '746491085852672'
        hash: string; // 'b5a998495119edde96a32a3a281431226ccfca48b377aee8f3226699b0ee577c'
        ledger: number; // 173806
        ts: number; // 1751137259
        protocol: number; // 22
        body: {
            tx: {
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
        const txData = body.data.body?.tx?.tx;
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
        const signatures = body.data.body?.tx?.signatures;
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

            if (result.isNewTransaction) {
                console.log('✅ NEW transaction processed successfully:', {
                    transactionId: result.transaction.id,
                    hash: result.transaction.transaction_hash,
                    walletMappingsCount: result.walletMappings.length,
                    walletMappings: result.walletMappings
                });
            } else {
                console.log('🔄 DUPLICATE webhook - transaction already processed:', {
                    transactionId: result.transaction.id,
                    hash: result.transaction.transaction_hash,
                    originalProcessedAt: result.transaction.created_at,
                    walletMappingsCount: result.walletMappings.length
                });
            }

            if (result.walletMappings.length > 0) {
                const logEmoji = result.isNewTransaction ? '🎯' : '📂';
                console.log(`${logEmoji} WALLET MAPPING ${result.isNewTransaction ? 'SUCCESS' : 'RETRIEVED'}! Found mappings:`);
                result.walletMappings.forEach((mapping: any, index: number) => {
                    console.log(`  Mapping ${index}:`, {
                        walletId: mapping.walletId,
                        address: mapping.address,
                        userId: mapping.userId,
                        confidence: mapping.confidence,
                        reason: mapping.reason
                    });
                });
            } else {
                const logEmoji = result.isNewTransaction ? '⚠️' : '📂';
                console.log(`${logEmoji} NO WALLET MAPPINGS FOUND - This transaction might be from an external user`);
            }

            return NextResponse.json(
                {
                    message: result.isNewTransaction ?
                        "Webhook received and processed" :
                        "Webhook received (duplicate transaction, idempotency handled)",
                    transactionHash: body.data.hash,
                    sourceAccount: body.data.body.tx.tx.source_account,
                    isNewTransaction: result.isNewTransaction,
                    walletMappingsFound: result.walletMappings.length,
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