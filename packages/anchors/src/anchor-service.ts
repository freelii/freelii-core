import { CoinsPHService } from "./coinsph/coinsph-service";
import { Anchor, PaymentRail, type AnchorQuote } from "./shared";




export class AnchorService {
    private anchors: Anchor[];

    constructor() {
        this.anchors = [
            new CoinsPHService()
        ]
    }

    // Get all available anchors for a specific transfer
    async getAvailableAnchors(
        amount: number,
        sourceCurrency: string,
        targetCurrency: string,
        paymentRail: PaymentRail
    ): Promise<Array<{ anchor: Anchor; quote: AnchorQuote }>> {
        const availableAnchors = this.anchors.filter(anchor =>
            anchor.supportsTransfer(sourceCurrency, targetCurrency, paymentRail)
        );

        const quotesPromises = availableAnchors.map(async anchor => {
            try {
                console.log('anchor quote', {
                    sourceCurrency,
                    targetCurrency,
                    sourceAmount: amount.toString(),
                });
                const quote = await anchor.getQuote({
                    sourceCurrency,
                    targetCurrency,
                    sourceAmount: amount.toString(),
                });
                return { anchor, quote };
            } catch (error) {
                console.error(`Failed to get quote from ${anchor.name}:`, error);
                return null;
            }
        });

        const quotes = await Promise.all(quotesPromises);

        console.log('quotes', quotes);

        return quotes.filter((quote): quote is { anchor: Anchor; quote: AnchorQuote } =>
            quote !== null
        );
    }

    // Get the optimal anchor based on various factors
    async getOptimalAnchor(
        amount: number,
        sourceCurrency: string,
        destinationCurrency: string,
        paymentRail: PaymentRail,
        preferences: {
            prioritizeFee?: boolean;
            prioritizeExchangeRate?: boolean;
        } = {}
    ): Promise<{ anchor: Anchor; quote: AnchorQuote }> {
        const availableAnchors = await this.getAvailableAnchors(
            amount,
            sourceCurrency,
            destinationCurrency,
            paymentRail
        );

        if (availableAnchors.length === 0) {
            throw new Error(`No anchors found for ${sourceCurrency} to ${destinationCurrency} on ${paymentRail}`);
        }

        // Score each anchor based on preferences
        const scoredAnchors = availableAnchors.map(({ anchor, quote }): { anchor: Anchor, quote: AnchorQuote, score: number } => {
            let score = 0;

            if (preferences.prioritizeFee) {
                // Lower fee is better
                score += (1 / quote.fee) * 100;
            }

            if (preferences.prioritizeExchangeRate) {
                // Higher exchange rate is better
                score += quote.exchangeRate * 100;
            }

            return { anchor, quote, score };
        });

        // Sort by score and return the best option
        scoredAnchors.sort((a, b) => b.score - a.score);


        if (!scoredAnchors[0]) {
            throw new Error(`No anchor found for ${sourceCurrency} to ${destinationCurrency} on ${paymentRail}`);
        }

        const { anchor, quote } = scoredAnchors[0];

        return { anchor, quote };
    }
}