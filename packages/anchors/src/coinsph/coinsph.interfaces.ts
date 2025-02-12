export interface Account {
    code: number,
    msg: string,
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
    INVALID_SIGNATURE: -1022,
}

export interface CashOutRequest {
    amount: string,
    asset: string,
    address: string,
    memo: string,
}

export interface CashOutParams {
    amount: string;
    currency: string;
    recipientName: string;
    recipientAccountNumber: string;
    recipientMobile?: string;
    recipientAddress?: string;
    remarks?: string;
    channelName: 'INSTAPAY' | 'SWIFTPAY_PESONET';
    channelSubject: string;
}

export interface CashOutResponse {
    status: number;
    error: string;
    data: {
        externalOrderId: string;
        internalOrderId: string;
    };
}

export enum COINS_CASH_OUT_ERRORS {
    ACCOUNT_DISABLED = 88010002,
    AMOUNT_TOO_LOW = 88010003,
    AMOUNT_TOO_HIGH = 88010004,
    DAILY_LIMIT_EXCEEDED = 88010005,
    MONTHLY_LIMIT_EXCEEDED = 88010006,
    ANNUAL_LIMIT_EXCEEDED = 88010007,
    METHOD_UNAVAILABLE_START = 88010008,
    METHOD_UNAVAILABLE_END = 88010011,
    ORDER_IN_PROGRESS = 88010012,
    INSUFFICIENT_BALANCE = 88010013,
    KYC_REQUIRED_START = 88010014,
    KYC_REQUIRED_END = 88010016,
    KYC_REQUIRED_ADDITIONAL = 88010018,
    PHONE_REQUIRED = 88010017,
    SERVER_ERROR = 88010000,
}

export interface FiatOrderExtendedMap {
    amount: string;
    sendAcctNo: string;
    tfrName: string;
    tfrAcctNo: string;
    channelName: string;
    currency: string;
    source: string;
    channelSubject: string;
    userId: number;
    orgId: number;
}

export interface FiatOrderDetails {
    externalOrderId: string;
    internalOrderId: string;
    paymentOrderId: string;
    fiatCurrency: string;
    fiatAmount: string;
    transactionType: number;
    transactionChannel: string;
    transactionSubject: string;
    transactionSubjectType: string;
    transactionChannelName: string;
    transactionSubjectName: string;
    feeCurrency: string;
    channelFee: string;
    platformFee: string;
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCEL';
    errorCode: string;
    errorMessage: string;
    completedTime: string;
    source: string;
    createdAt: string;
    orderExtendedMap: FiatOrderExtendedMap;
    dealCancel: boolean;
}

export interface FiatOrderHistoryRequest {
    pageNum?: string;
    pageSize?: string;
    externalOrderId?: string;
    internalOrderId?: string;
    transactionType?: 1 | -1;
    transactionChannel?: 'INSTAPAY' | 'SWIFTPAY_PESONET';
    transactionSubject?: string;
    status?: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCEL';
    fiatCurrency?: string;
    startDate?: string;
    endDate?: string;
    startTime?: number;
    endTime?: number;
}

export interface FiatOrderHistoryResponse {
    data: FiatOrderDetails[];
    total: number;
}

export interface OrderHistoryRequest {
    startTime?: string;
    endTime?: string;
    status?: 'TODO' | 'SUCCESS' | 'FAILED' | 'PROCESSING';
    page?: number;
    size?: number;
}

export interface OrderHistoryItem {
    id: string;
    orderId: string;
    quoteId: string;
    userId: string;
    sourceCurrency: string;
    sourceCurrencyIcon: string;
    targetCurrency: string;
    targetCurrencyIcon: string;
    sourceAmount: string;
    targetAmount: string;
    price: string;
    status: 'TODO' | 'SUCCESS' | 'FAILED' | 'PROCESSING';
    createdAt: string;
    errorCode: string;
    errorMessage: string;
    inversePrice: string;
}

export interface OrderHistoryResponse {
    data: OrderHistoryItem[];
    total: number;
}

export interface SubAccountDepositAddressRequest {
    email: string;
    coin: string;
    network: string;
    recvWindow?: number;
}

export interface SubAccountDepositAddressResponse {
    coin: string;
    address: string;
    addressTag: string;
}