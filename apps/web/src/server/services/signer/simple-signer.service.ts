import { PrismaClient } from '@prisma/client';
import { SignerEncryptionService } from './signer-encryption.service';
import { StellarKeypairService, type StellarKeyPair } from './stellar-keypair.service';

export interface CreateSignerInput {
    alias?: string;
    walletId?: string;
    network?: string;
    environment?: 'testnet' | 'mainnet';
    maxUsageLimit?: number;
    expiresAt?: Date;
    policyConfig?: Record<string, any>;
}

export interface SignerData {
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
    privateKey?: string; // Only included when requested
}

export interface PolicyConfig {
    recipient: string;
    amount: string;
    currency: string;
    description?: string;
}

export class SimpleSignerService {
    private prisma: PrismaClient;
    private encryptionService: SignerEncryptionService;
    private keypairService: StellarKeypairService;

    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || new PrismaClient();
        this.encryptionService = new SignerEncryptionService();
        this.keypairService = new StellarKeypairService();
    }

    /**
     * Generate a new keypair for testing
     */
    generateKeypair(): StellarKeyPair {
        return this.keypairService.generateKeypair();
    }

    /**
     * Test encryption functionality
     */
    testEncryption(testData?: string): boolean {
        return this.encryptionService.testEncryption(testData);
    }

    /**
     * Encrypt a private key
     */
    encryptPrivateKey(privateKey: string): string {
        return this.encryptionService.encryptPrivateKey(privateKey);
    }

    /**
     * Decrypt a private key
     */
    decryptPrivateKey(encryptedData: string): string {
        return this.encryptionService.decryptPrivateKey(encryptedData);
    }

    /**
     * Validate a Stellar keypair
     */
    validateKeypair(publicKey: string, privateKey: string): boolean {
        return this.keypairService.validateKeypair(publicKey, privateKey);
    }

    /**
     * Generate a secure encryption key
     */
    static generateEncryptionKey(): string {
        return SignerEncryptionService.generateEncryptionKey();
    }

    /**
     * Comprehensive keypair validation
     */
    comprehensiveValidation(publicKey: string, privateKey: string) {
        return this.keypairService.comprehensiveValidation(publicKey, privateKey);
    }

    /**
     * Create a signer record (when database is working)
     * This method will work once the Prisma types are properly generated
     */
    async createSignerRecord(userId: number, input: CreateSignerInput): Promise<SignerData | null> {
        try {
            // Generate new keypair
            const keypair = this.generateKeypair();

            // Encrypt the private key
            const encryptedPrivateKey = this.encryptPrivateKey(keypair.privateKey);

            // Prepare data for database insertion
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

            // This will work once the Prisma model is properly recognized
            const signer = await (this.prisma as any).signer.create({
                data: signerData,
            });

            // Return without encrypted private key
            const { encrypted_private_key, ...signerWithoutEncrypted } = signer;
            return {
                ...signerWithoutEncrypted,
                privateKey: keypair.privateKey // Include for initial setup
            };
        } catch (error) {
            console.error('Failed to create signer record:', error);
            return null;
        }
    }

    /**
     * Create a complete signer workflow (generates keypair and optionally stores in DB)
     */
    async createCompleteSigner(
        userId: number,
        input: CreateSignerInput,
        storeInDatabase = false
    ): Promise<{
        keypair: StellarKeyPair;
        encryptedPrivateKey: string;
        signerData?: SignerData | null;
    }> {
        // Generate keypair
        const keypair = this.generateKeypair();

        // Encrypt private key
        const encryptedPrivateKey = this.encryptPrivateKey(keypair.privateKey);

        // Optionally store in database
        let signerData: SignerData | null = null;
        if (storeInDatabase) {
            signerData = await this.createSignerRecord(userId, input);
        }

        return {
            keypair,
            encryptedPrivateKey,
            signerData
        };
    }

    /**
     * Create a signer for one-time policy usage
     */
    async createOneTimePolicySigner(
        userId: number,
        walletId: string,
        policyConfig: PolicyConfig,
        storeInDatabase = false
    ) {
        return this.createCompleteSigner(userId, {
            alias: `One-time: ${policyConfig.recipient}`,
            walletId,
            environment: 'testnet',
            maxUsageLimit: 1,
            policyConfig: policyConfig
        }, storeInDatabase);
    }

    /**
     * Clean up resources
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
} 