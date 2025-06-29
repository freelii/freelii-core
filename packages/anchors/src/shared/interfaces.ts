export interface QuoteParams {
    sourceCurrency: string;
    targetCurrency: string;
}

export interface RecipientDetails {
    name: string;
    accountNumber: string;
    bankName?: string;
    ewalletProvider?: string;
    mobileNumber?: string;
}

export interface QuoteForTarget extends QuoteParams {
    targetAmount: string;
}

export interface QuoteForSource extends QuoteParams {
    sourceAmount: string;
}

export interface GetQuoteParams extends QuoteParams {
    sourceAmount?: string;
    targetAmount?: string;
    quoteId?: string;
    recipientDetails?: RecipientDetails;
}

export interface CashoutParams extends QuoteParams {
    targetAmount: number;
    recipientDetails: RecipientDetails;
}

export interface AnchorRate {
    exchangeRate: number;
    expiresIn?: number; // in seconds
}

export interface AnchorQuote extends AnchorRate {
    quoteId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    targetAmount: string;
    fee: string;
    total: string;
}

export interface PaymentDestination {
    id: string;
    created_at: Date;
    updated_at: Date;
    payment_rail: "STELLAR" | "WIRE" | "ACH" | "SEPA" | "PH_INSTAPAY" | "PH_PESONET" | "MX_SPEI";
    currency: string;
    client_id: number;
    blockchain_account_id: string | null;
    ewallet_account_id: string | null;
    fiat_account_id: string | null;
    is_default: boolean;
    blockchain_account: BlockchainAccount | null;
    ewallet_account: EwalletAccount | null;
    fiat_account: FiatAccount | null;
}

export interface BlockchainAccount {
    id: string;
    created_at: Date;
    updated_at: Date;
    address: string;
    network: string;
    environment: string;
    client_id: number | null;
    user_id: number | null;
}

export interface EwalletAccount {
    id: string;
    created_at: Date;
    updated_at: Date;
    iso_currency: string;
    mobile_number: string | null;
    ewallet_provider: EwalletProvider | null;
    client_id: number | null;
    user_id: number | null;
    account_number: string | null;
}

export interface FiatAccount {
    id: string;
    created_at: Date;
    updated_at: Date;
    iso_currency: string;
    account_number: string | null;
    alias: string;
    routing_number: string | null;
    bank_name: string | null;
    bank_address: string | null;
    bank_city: string | null;
    bank_state: string | null;
    bank_zip: string | null;
    client_id: number | null;
    account_holder_name: string | null;
    account_type: FiatAccountType;
    transfer_method: TransferMethod | null;
    user_id: number | null;
}

enum EwalletProvider {
    PH_GCASH = "ph_gcash",
    PH_MAYA = "ph_maya",
    PH_COINS_PH = "ph_coins_ph"
}

enum FiatAccountType {
    CHECKING = "checking",
    SAVINGS = "savings"
}

enum TransferMethod {
    PH_PESONET = "ph_pesonet",
    PH_INSTAPAY = "ph_instapay"
}

export type PaymentRail = "STELLAR" | "WIRE" | "ACH" | "SEPA" | "PH_INSTAPAY" | "PH_PESONET" | "MX_SPEI";