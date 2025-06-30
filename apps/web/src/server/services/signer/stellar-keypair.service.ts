import { Keypair, StrKey } from '@stellar/stellar-sdk';
import crypto from 'crypto';

export interface StellarKeyPair {
    publicKey: string;   // G address
    privateKey: string;  // S secret key
}

export interface KeyPairValidation {
    isValid: boolean;
    publicKeyValid: boolean;
    privateKeyValid: boolean;
    keypairMatches: boolean;
    errors: string[];
}

export class StellarKeypairService {
    /**
     * Generate a new random Stellar Ed25519 keypair
     * @returns Object containing public key (G address) and private key (S secret)
     */
    generateKeypair(): StellarKeyPair {
        try {
            const keypair = Keypair.random();

            return {
                publicKey: keypair.publicKey(),
                privateKey: keypair.secret()
            };
        } catch (error) {
            throw new Error(`Failed to generate keypair: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate a keypair from existing private key
     * @param privateKey - The private key (S secret)
     * @returns Object containing public key and private key
     */
    keypairFromPrivateKey(privateKey: string): StellarKeyPair {
        try {
            const keypair = Keypair.fromSecret(privateKey);

            return {
                publicKey: keypair.publicKey(),
                privateKey: keypair.secret()
            };
        } catch (error) {
            throw new Error(`Failed to create keypair from private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate a Stellar public key (G address)
     * @param publicKey - The public key to validate
     * @returns Boolean indicating if the public key is valid
     */
    isValidPublicKey(publicKey: string): boolean {
        try {
            return StrKey.isValidEd25519PublicKey(publicKey);
        } catch {
            return false;
        }
    }

    /**
     * Validate a Stellar private key (S secret)
     * @param privateKey - The private key to validate
     * @returns Boolean indicating if the private key is valid
     */
    isValidPrivateKey(privateKey: string): boolean {
        try {
            return StrKey.isValidEd25519SecretSeed(privateKey);
        } catch {
            return false;
        }
    }

    /**
     * Validate that a public/private key pair match
     * @param publicKey - The public key (G address)
     * @param privateKey - The private key (S secret)
     * @returns Boolean indicating if the keys are a matching pair
     */
    validateKeypair(publicKey: string, privateKey: string): boolean {
        try {
            const keypair = Keypair.fromSecret(privateKey);
            return keypair.publicKey() === publicKey;
        } catch {
            return false;
        }
    }

    /**
     * Comprehensive validation of a keypair
     * @param publicKey - The public key to validate
     * @param privateKey - The private key to validate
     * @returns Detailed validation results
     */
    comprehensiveValidation(publicKey: string, privateKey: string): KeyPairValidation {
        const errors: string[] = [];

        const publicKeyValid = this.isValidPublicKey(publicKey);
        if (!publicKeyValid) {
            errors.push('Invalid public key format');
        }

        const privateKeyValid = this.isValidPrivateKey(privateKey);
        if (!privateKeyValid) {
            errors.push('Invalid private key format');
        }

        let keypairMatches = false;
        if (publicKeyValid && privateKeyValid) {
            keypairMatches = this.validateKeypair(publicKey, privateKey);
            if (!keypairMatches) {
                errors.push('Public and private keys do not match');
            }
        }

        return {
            isValid: publicKeyValid && privateKeyValid && keypairMatches,
            publicKeyValid,
            privateKeyValid,
            keypairMatches,
            errors
        };
    }

    /**
     * Generate a keypair from a seed phrase or deterministic input
     * @param seed - Seed data (string or Buffer)
     * @returns Generated keypair
     */
    generateFromSeed(seed: string | Buffer): StellarKeyPair {
        try {
            // Convert string to buffer if needed
            const seedBuffer = typeof seed === 'string' ? Buffer.from(seed, 'utf8') : seed;

            // Create a 32-byte seed from the input
            const hash = crypto.createHash('sha256').update(seedBuffer).digest();

            // Generate keypair from the hash
            const keypair = Keypair.fromRawEd25519Seed(hash);

            return {
                publicKey: keypair.publicKey(),
                privateKey: keypair.secret()
            };
        } catch (error) {
            throw new Error(`Failed to generate keypair from seed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract public key from private key
     * @param privateKey - The private key (S secret)
     * @returns The corresponding public key (G address)
     */
    getPublicKeyFromPrivate(privateKey: string): string {
        try {
            const keypair = Keypair.fromSecret(privateKey);
            return keypair.publicKey();
        } catch (error) {
            throw new Error(`Failed to extract public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if an address is a valid Stellar account address
     * @param address - Address to check
     * @returns Boolean indicating if it's a valid account address
     */
    isAccountAddress(address: string): boolean {
        return this.isValidPublicKey(address);
    }

    /**
     * Check if an address is a valid Stellar contract address
     * @param address - Address to check
     * @returns Boolean indicating if it's a valid contract address
     */
    isContractAddress(address: string): boolean {
        try {
            return StrKey.isValidContract(address);
        } catch {
            return false;
        }
    }
} 