export interface CreateWalletDto {
    alias: string;
    externalId?: string;
}

export interface WalletBalanceDto {
    id: string;
    address: string;
    currency: string;
    amount: bigint;
}

export interface WalletDto {
    id: string;
    userId: number;
    alias: string;
    address: string;
    network: string;
    networkEnvironment: string;
    keyId: string;
    balances: WalletBalanceDto[];
    mainBalance: WalletBalanceDto | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransferDto {
    amount: string;
    tokenId: string;
}