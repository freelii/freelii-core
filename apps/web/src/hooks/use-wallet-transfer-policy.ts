import { useStellar } from "@/contexts/stellar-context";
import { useStellarClients } from "@/hooks/use-stellar-clients";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Client as WalletTransferPolicyClient } from 'wallet_transfer_policy';

// The deployed wallet transfer policy contract address
const WALLET_TRANSFER_POLICY_ADDRESS = 'CCU7H7QGEU6V43WY22I3JFLP7NLQYF7OWZ5RQAYPYNR3IVPJTRI54JX2';

export interface WalletTransferPolicyHook {
    isLoading: boolean;
    policyAddress: string;
    initializePolicy: (account: { address: string; key_id: string }) => Promise<void>;
    addAuthorizedWallet: (recipientAddress: string, account: { address: string; key_id: string }) => Promise<void>;
    checkPolicyStatus: () => Promise<{ isInitialized: boolean; admin?: string }>;
}

export function useWalletTransferPolicy(): WalletTransferPolicyHook {
    const [isLoading, setIsLoading] = useState(false);
    const { config, network } = useStellar();
    const { account: smartWallet, server } = useStellarClients();

    // Helper function to wait for wallet connection
    const waitForWalletConnection = async (maxRetries = 20): Promise<void> => {
        let retries = 0;
        while (!smartWallet?.wallet && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
        }

        if (!smartWallet?.wallet) {
            throw new Error('Smart wallet connection timeout. Please ensure wallet is connected first.');
        }

        console.log('✓ Wallet connection confirmed:', smartWallet.wallet.options.contractId);
    };

    const checkPolicyStatus = async () => {
        try {
            console.log('Checking policy status for network:', network);
            console.log('Policy address:', WALLET_TRANSFER_POLICY_ADDRESS);

            // TODO: Implement actual contract status check
            // This would involve querying the contract's admin storage

            return { isInitialized: false };
        } catch (error) {
            console.error('Error checking policy status:', error);
            return { isInitialized: false };
        }
    };

    const initializePolicy = async (account: { address: string; key_id: string }): Promise<void> => {
        setIsLoading(true);
        try {
            if (!account?.address) {
                throw new Error('No wallet account found');
            }

            console.log('⏳ Waiting for wallet connection...');
            await waitForWalletConnection();

            console.log('Starting policy initialization for admin:', smartWallet.wallet!.options.contractId);

            // Connect to existing deployed contract
            const client = new WalletTransferPolicyClient({
                contractId: WALLET_TRANSFER_POLICY_ADDRESS,
                rpcUrl: config.rpcUrl,
                networkPassphrase: config.networkPassphrase,
                allowHttp: config.rpcUrl.startsWith('http://'), // Allow HTTP for local testing
            });

            // Use the smart wallet contract address as admin (not public key)
            const adminAddress = smartWallet.wallet!.options.contractId;
            const initTx = await client.init({ admin: adminAddress });
            console.log("initTx", initTx)

            // Sign and submit the transaction
            const result = await smartWallet.sign(initTx.built!, {
                keyId: smartWallet.keyId
            });
            console.log("result", result)
            const sent = await server.send(initTx.built!);
            console.log("sent", sent)

            console.log('Policy initialization transaction result:', result);
            toast.success('Wallet transfer policy enabled successfully!');
        } catch (error) {
            console.error('Error initializing policy:', error);
            toast.error((error as Error)?.message ?? "Failed to initialize policy");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const addAuthorizedWallet = async (recipientAddress: string, account: { address: string; key_id: string }): Promise<void> => {
        setIsLoading(true);
        try {
            if (!account?.address) {
                throw new Error('No wallet account found');
            }

            console.log('Adding authorized wallet:', {
                policyAddress: WALLET_TRANSFER_POLICY_ADDRESS,
                recipientAddress,
                network
            });

            // Connect to the contract
            const client = new WalletTransferPolicyClient({
                contractId: WALLET_TRANSFER_POLICY_ADDRESS,
                rpcUrl: config.rpcUrl,
                networkPassphrase: config.networkPassphrase,
                allowHttp: config.rpcUrl.startsWith('http://'),
            });

            console.log('⏳ Waiting for wallet connection...');
            await waitForWalletConnection();

            // Get the signer's public key (32 bytes) from the connected wallet
            const signerPublicKey = smartWallet.wallet!.options.publicKey;
            if (!signerPublicKey) {
                throw new Error('Unable to get signer public key from wallet');
            }

            // Convert from hex string to Buffer (remove '0x' prefix if present)
            const pubkeyHex = signerPublicKey.startsWith('0x') ? signerPublicKey.slice(2) : signerPublicKey;
            const signerPubkey = Buffer.from(pubkeyHex, 'hex');

            // Ensure it's 32 bytes
            if (signerPubkey.length !== 32) {
                throw new Error(`Invalid public key length: expected 32 bytes, got ${signerPubkey.length}`);
            }

            // Get the smart wallet contract address
            const smartWalletAddress = smartWallet.wallet!.options.contractId;

            // Get the main balance contract address (the asset contract for USDC transfers)
            const mainBalanceContractId = config.mainBalance;
            console.log('Configuring policy for main balance contract:', mainBalanceContractId);

            const addTx = await client.add_wallet_signer({
                signer_pubkey: signerPubkey,
                smart_wallet: smartWalletAddress,
                authorized_recipients: [recipientAddress]
            });

            // Sign and submit the transaction  
            const result = await smartWallet.sign(addTx.built!, {
                keyId: smartWallet.keyId
            });
            console.log("Signed transaction:", result);

            const sent = await server.send(addTx.built!);
            console.log('Add authorized wallet result:', sent);
            toast.success('Authorized wallet added successfully!');
        } catch (error) {
            console.error('Error adding authorized wallet:', error);
            toast.error((error as Error)?.message ?? "Failed to add authorized wallet");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        policyAddress: WALLET_TRANSFER_POLICY_ADDRESS,
        initializePolicy,
        addAuthorizedWallet,
        checkPolicyStatus
    };
} 