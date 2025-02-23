import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import forge from "node-forge";

export class CircleService {
    private publicKey?: string;
    private ciphertext?: string;

    get blockchain() {
        if (process.env.NODE_ENV === 'development') {
            return "SOL-DEVNET";
        } else {
            return "SOL";
        }
    }


    async getPublicKey() {
        if (this.publicKey) {
            return this.publicKey;
        }

        // Import & Initialize
        const client = initiateDeveloperControlledWalletsClient({
            apiKey: process.env.CIRCLE_API_KEY as string,
            entitySecret: process.env.CIRCLE_ENTITY_SECRET as string
        });

        const response = await client.getPublicKey();
        console.log(response);
        if (typeof response === 'string') {
            this.publicKey = response;
        } else {
            throw new Error('Failed to get public key');
        }
        return this.publicKey!;
    }

    async getCiphertext(): Promise<string> {
        if (this.ciphertext) {
            return this.ciphertext;
        }

        const entitySecret = forge.util.hexToBytes(process.env.CIRCLE_ENTITY_SECRET as string);
        const publicKey = forge.pki.publicKeyFromPem(await this.getPublicKey());

        const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP',
            {
                md: forge.md.sha256.create(),
                mgf1: { md: forge.md.sha256.create(), },
            });

        const ciphertext = forge.util.encode64(encryptedData);
        if (ciphertext.length !== 684) {
            throw new Error('Invalid ciphertext');
        }
        this.ciphertext = ciphertext;
        return this.ciphertext!;
    }

    async createWallet(idempotencyKey: string, name: string) {
        // Import & Initialize
        const client = initiateDeveloperControlledWalletsClient({
            apiKey: process.env.CIRCLE_API_KEY as string,
            entitySecret: process.env.CIRCLE_ENTITY_SECRET as string
        });

        const response = await client.createWalletSet({
            name,
            idempotencyKey,
        });

        if (!response.data?.walletSet.id) {
            throw new Error('Failed to create wallet set');
        }

        console.log('createWallets response:', response.data?.walletSet.id);
        console.log(this.blockchain);


        const wallet = await client.createWallets({
            blockchains: [this.blockchain],
            count: 1,
            metadata: [{
                name,
                refId: idempotencyKey,
            }],
            walletSetId: response.data?.walletSet.id,
        });

        if (!wallet.data?.wallets[0]?.id) {
            throw new Error('Failed to create wallet');
        }

        return {
            walletSet: response.data?.walletSet,
            wallet: wallet.data?.wallets[0],
        };
    }

    async getWallets() {
        const client = initiateDeveloperControlledWalletsClient({
            apiKey: process.env.CIRCLE_API_KEY as string,
            entitySecret: process.env.CIRCLE_ENTITY_SECRET as string
        });


        const response = await client.getWalletSet({ id: '0be3817b-b7f4-51e2-8fae-d563ed96ee5f' });
        if (response.data) {
            return response.data;
        } else {
            throw new Error('Failed to get wallets');
        }
    }

    async getWalletBalance(walletId: string) {
        console.log('walletId:', walletId);
        const client = initiateDeveloperControlledWalletsClient({
            apiKey: process.env.CIRCLE_API_KEY as string,
            entitySecret: process.env.CIRCLE_ENTITY_SECRET as string
        });
        const response = await client.getWalletTokenBalance({
            id: walletId
        });
        return response.data;
    }

    async transfer(walletId: string, amount: string, tokenId: string) {
        const client = initiateDeveloperControlledWalletsClient({
            apiKey: process.env.CIRCLE_API_KEY as string,
            entitySecret: process.env.CIRCLE_ENTITY_SECRET as string
        });

        const response = await client.createTransaction({
            walletId,
            tokenId,
            destinationAddress: 'BTxZuq9ttU83N8PLFocPYiQgpgtF42Rajtd5sEu76mnP',
            amount: [amount],
            fee: {
                type: 'level',
                config: {
                    feeLevel: 'HIGH'
                }
            }
        });
        console.log('response:', response.data);
        return response.data;
    }
}