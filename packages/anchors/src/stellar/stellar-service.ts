import crypto from "crypto";
import { Anchor, AnchorQuote, AnchorRate, CashoutParams, GetQuoteParams, PaymentDestination, PaymentRail, QuoteParams } from "../shared";

export class StellarService extends Anchor {
    name = "Stellar";
    supportedPaymentRails = [PaymentRail.CRYPTO];
    supportedCurrencies = ["USDC"];

    requestQuote(params: GetQuoteParams): Promise<AnchorQuote> {
        return Promise.resolve({
            quoteId: crypto.randomUUID(),
            exchangeRate: 1,
            expiresIn: 100000,
            sourceCurrency: params.sourceCurrency,
            targetCurrency: params.targetCurrency,
            sourceAmount: params.sourceAmount ?? "0",
            targetAmount: params.targetAmount ?? "0",
            fee: "0",
            total: params.sourceAmount ?? "0",
        })
    }
    getRate(params: QuoteParams): Promise<AnchorRate> {
        return Promise.resolve({
            exchangeRate: 1,
            expiresIn: 100000,
        })
    }
    supportsTransfer(sourceCurrency: string, destinationCurrency: string, paymentRail: PaymentRail): boolean {
        return this.supportedCurrencies.includes(sourceCurrency)
            && this.supportedPaymentRails.includes(paymentRail)
            && sourceCurrency === destinationCurrency
    }
    requestCashout(params: CashoutParams): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getLiquidationAddress(destination: PaymentDestination): Promise<string> {
        if (destination.blockchain_account) {
            return Promise.resolve(destination.blockchain_account.address);
        }

        throw new Error("No liquidation address found");
    }
    convertCurrency(sourceCurrency: string, destinationCurrency: string, sourceAmount: number, expectedTargetAmount: number): Promise<number> {
        throw new Error("Method not implemented.");
    }
}