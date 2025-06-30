import { env } from '@/env';
import crypto from 'crypto';

export class SignerEncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32; // 256 bits
    private readonly ivLength = 16; // 128 bits
    private readonly tagLength = 16; // 128 bits
    private readonly encryptionKey: Buffer;

    constructor() {
        const keyString = env.SIGNER_ENCRYPTION_KEY;
        if (!keyString) {
            throw new Error('SIGNER_ENCRYPTION_KEY environment variable is required');
        }

        // Ensure key is exactly 32 bytes
        if (keyString.length !== 64) { // 32 bytes = 64 hex characters
            throw new Error('SIGNER_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
        }

        this.encryptionKey = Buffer.from(keyString, 'hex');
    }

    /**
     * Encrypt a private key string
     * @param privateKey - The raw private key to encrypt
     * @returns Encrypted data in format: iv:authTag:encryptedData (all hex)
     */
    encryptPrivateKey(privateKey: string): string {
        if (!privateKey) {
            throw new Error('Private key is required for encryption');
        }

        // Generate random IV
        const iv = crypto.randomBytes(this.ivLength);

        // Create cipher
        const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);

        // Encrypt the private key
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag for GCM mode
        const authTag = cipher.getAuthTag();

        // Return format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt a private key string
     * @param encryptedData - Encrypted data in format: iv:authTag:encryptedData
     * @returns The decrypted private key
     */
    decryptPrivateKey(encryptedData: string): string {
        if (!encryptedData) {
            throw new Error('Encrypted data is required for decryption');
        }

        try {
            // Parse the encrypted data
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format');
            }

            const [ivHex, authTagHex, encrypted] = parts;
            const iv = Buffer.from(ivHex!, 'hex');
            const authTag = Buffer.from(authTagHex!, 'hex');

            // Validate lengths
            if (iv.length !== this.ivLength) {
                throw new Error('Invalid IV length');
            }
            if (authTag.length !== this.tagLength) {
                throw new Error('Invalid auth tag length');
            }

            // Create decipher
            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAuthTag(authTag);

            // Decrypt
            let decrypted = decipher.update(encrypted!, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Failed to decrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate a secure encryption key for environment setup
     * @returns A 32-byte hex string suitable for SIGNER_ENCRYPTION_KEY
     */
    static generateEncryptionKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Test the encryption/decryption round trip
     * @param testData - Optional test data, defaults to a sample private key
     * @returns Boolean indicating if encryption/decryption works correctly
     */
    testEncryption(testData = 'SAMPLEKEY1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'): boolean {
        try {
            const encrypted = this.encryptPrivateKey(testData);
            const decrypted = this.decryptPrivateKey(encrypted);
            return decrypted === testData;
        } catch (error) {
            console.error('Encryption test failed:', error);
            return false;
        }
    }
} 