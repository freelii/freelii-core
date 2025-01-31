export interface Account {
    canTrade: boolean,
    canDeposit: boolean,
    canWithdraw: boolean,
    accountType: string,
    updateTime: number,
    balances: [
        { asset: 'PHP', free: '1000', locked: '0' },
        { asset: 'USDC', free: '100', locked: '0' }
    ],
    token: string,
    daily: {
        cashInLimit: string,
        cashInRemaining: string,
        cashOutLimit: string, // e.g. '10000000',
        cashOutRemaining: string, // e.g. '10000000',
        totalWithdrawLimit: string, // e.g. '88888888888888111',
        totalWithdrawRemaining: string, // e.g. '88888888888888111'
    },
    monthly: {
        cashInLimit: string, // e.g. '777777777777',
        cashInRemaining: string, // e.g. '777777777777',
        cashOutLimit: string, // e.g. '200000000',
        cashOutRemaining: string, // e.g. '200000000',
        totalWithdrawLimit: string, // e.g. '8888888888888811',
        totalWithdrawRemaining: string, // e.g. '8888888888888811'
    },
    annually: {
        cashInLimit: string, // e.g. '777777777777',
        cashInRemaining: string, // e.g. '777777777777',
        cashOutLimit: string, // e.g. '24000000000',
        cashOutRemaining: string, // e.g. '24000000000',
        totalWithdrawLimit: string, // e.g. '88888888888888',
        totalWithdrawRemaining: string, // e.g. '88888888888888'
    }
}

export const COINS_ERRORS = {
    INSUFFICIENT_BALANCE: 10000003,
}

export interface CashOutRequest {
    amount: string,
    asset: string,
    address: string,
    memo: string,
}