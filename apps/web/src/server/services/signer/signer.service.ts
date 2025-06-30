import { BaseService, type BaseServiceOptions } from '../base-service';
import { SignerEncryptionService } from './signer-encryption.service';
import { StellarKeypairService } from './stellar-keypair.service';

export interface CreateSignerInput {
    alias?: string;
    walletId?: string;
    network?: string;
    environment?: 'testnet' | 'mainnet';
    maxUsageLimit?: number;
    expiresAt?: Date;
    policyConfig?: Record<string, any>;
}

export interface SignerWithKeys {
    id: string;
    created_at: Date;
    updated_at: Date;
    public_key: string;
    alias?: string | null;
    network: string;
    environment: string;
    is_active: boolean;
    usage_count: number;
    max_usage_limit?: number | null;
    last_used_at?: Date | null;
    expires_at?: Date | null;
    policy_config?: string | null;
    user_id: number;
    wallet_id?: string | null;
    privateKey?: string; // Only included when explicitly requested
}

export interface PolicyConfig {
    recipient: string;
    amount: string;
    currency: string;
    description?: string;
}

export class SignerService extends BaseService {
    private encryptionService: SignerEncryptionService;
    private keypairService: StellarKeypairService;

    constructor(options: BaseServiceOptions) {
        super(options);
        this.encryptionService = new SignerEncryptionService();
        this.keypairService = new StellarKeypairService();
    }

    /**
     * Create a new signer with generated Ed25519 keypair
     */
    async createSigner(userId: number, input: CreateSignerInput): Promise<SignerWithKeys> {
        // Generate new Ed25519 keypair
        const keypair = this.keypairService.generateKeypair();

        // Encrypt the private key
        const encryptedPrivateKey = this.encryptionService.encryptPrivateKey(keypair.privateKey);

        // Create signer record
        const signerData = {
            public_key: keypair.publicKey,
            encrypted_private_key: encryptedPrivateKey,
            alias: input.alias,
            network: input.network ?? 'stellar',
            environment: input.environment ?? 'testnet',
            max_usage_limit: input.maxUsageLimit,
            expires_at: input.expiresAt,
            policy_config: input.policyConfig ? JSON.stringify(input.policyConfig) : null,
            user_id: userId,
            wallet_id: input.walletId,
        };

        const signer = await this.db.signer.create({
            data: signerData,
        });

        // Return signer without encrypted private key, but with decrypted private key
        const { encrypted_private_key, ...signerWithoutEncrypted } = signer;
        return {
            ...signerWithoutEncrypted,
            privateKey: keypair.privateKey // Include for initial setup
        };
    }

    /**
     * Get signer by ID with optional private key decryption
     */
    async getSignerById(id: string, includePrivateKey = false): Promise<SignerWithKeys | null> {
        const signer = await this.db.signers.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                },
                wallet: {
                    select: { id: true, alias: true, address: true }
                }
            }
        });

        if (!signer) {
            return null;
        }

        const { encrypted_private_key, ...signerWithoutEncrypted } = signer;

        let privateKey: string | undefined;
        if (includePrivateKey) {
            try {
                privateKey = this.encryptionService.decryptPrivateKey(encrypted_private_key);
            } catch (error) {
                console.error('Failed to decrypt private key:', error);
                // Don't throw here, just exclude the private key
            }
        }

        return {
            ...signerWithoutEncrypted,
            ...(privateKey ? { privateKey } : {})
        };
    }

    /**
     * Get all signers for a user
     */
    async getSignersForUser(userId: number, includePrivateKeys = false): Promise<SignerWithKeys[]> {
        const signers = await this.db.signers.findMany({
            where: {
                user_id: userId,
                is_active: true
            },
            orderBy: { created_at: 'desc' },
            include: {
                wallet: {
                    select: { id: true, alias: true, address: true }
                }
            }
        });

        return Promise.all(signers.map(async (signer) => {
            const { encrypted_private_key, ...signerWithoutEncrypted } = signer;

            let privateKey: string | undefined;
            if (includePrivateKeys) {
                try {
                    privateKey = this.encryptionService.decryptPrivateKey(encrypted_private_key);
                } catch (error) {
                    console.error(`Failed to decrypt private key for signer ${signer.id}:`, error);
                }
            }

            return {
                ...signerWithoutEncrypted,
                ...(privateKey ? { privateKey } : {})
            };
        }));
    }

    /**
     * Get active signers for a wallet
     */
    async getSignersForWallet(walletId: string): Promise<SignerWithKeys[]> {
        const signers = await this.db.signers.findMany({
            where: {
                wallet_id: walletId,
                is_active: true,
                OR: [
                    { expires_at: null },
                    { expires_at: { gt: new Date() } }
                ]
            },
            orderBy: { created_at: 'desc' }
        });

        return signers.map(signer => {
            const { encrypted_private_key, ...signerWithoutEncrypted } = signer;
            return signerWithoutEncrypted;
        });
    }

    /**
     * Update signer usage tracking
     */
    async recordSignerUsage(signerId: string): Promise<void> {
        await this.db.signers.update({
            where: { id: signerId },
            data: {
                usage_count: { increment: 1 },
                last_used_at: new Date()
            }
        });
    }

    /**
     * Deactivate a signer
     */
    async deactivateSigner(signerId: string): Promise<void> {
        await this.db.signers.update({
            where: { id: signerId },
            data: { is_active: false }
        });
    }

    /**
     * Delete a signer (permanent removal)
     */
    async deleteSigner(signerId: string): Promise<void> {
        await this.db.signer.delete({
            where: { id: signerId }
        });
    }

    /**
     * Check if a signer has reached its usage limit
     */
    async isSignerUsageLimitReached(signerId: string): Promise<boolean> {
        const signer = await this.db.signers.findUnique({
            where: { id: signerId },
            select: { usage_count: true, max_usage_limit: true }
        });

        if (!signer || !signer.max_usage_limit) {
            return false;
        }

        return signer.usage_count >= signer.max_usage_limit;
    }

    /**
     * Validate signer keypair integrity
     */
    async validateSignerKeypair(signerId: string): Promise<boolean> {
        const signer = await this.db.signers.findUnique({
            where: { id: signerId },
            select: { public_key: true, encrypted_private_key: true }
        });

        if (!signer) {
            return false;
        }

        try {
            const privateKey = this.encryptionService.decryptPrivateKey(signer.encrypted_private_key);
            return this.keypairService.validateKeypair(signer.public_key, privateKey);
        } catch (error) {
            console.error(`Failed to validate keypair for signer ${signerId}:`, error);
            return false;
        }
    }

    /**
     * Get decrypted private key for a signer (use with caution)
     */
    async getSignerPrivateKey(signerId: string): Promise<string | null> {
        const signer = await this.db.signers.findUnique({
            where: { id: signerId },
            select: { encrypted_private_key: true, is_active: true }
        });

        if (!signer || !signer.is_active) {
            return null;
        }

        try {
            return this.encryptionService.decryptPrivateKey(signer.encrypted_private_key);
        } catch (error) {
            console.error(`Failed to decrypt private key for signer ${signerId}:`, error);
            return null;
        }
    }

    /**
     * Create a signer for one-time policy
     */
    async createOneTimePolicySigner(
        userId: number,
        walletId: string,
        policyConfig: PolicyConfig
    ): Promise<SignerWithKeys> {
        return this.createSigner(userId, {
            alias: `One-time: ${policyConfig.recipient}`,
            walletId,
            environment: 'testnet', // Default to testnet for policies
            maxUsageLimit: 1, // One-time use only
            policyConfig: policyConfig
        });
    }
} 