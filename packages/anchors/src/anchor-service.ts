import { CoinsPHService } from "./coinsph/coinsph-service";
import { Anchor, AnchorRate, PaymentRail } from "./shared";




export class AnchorService {
    private anchors: Anchor[];

    constructor() {
        this.anchors = [
            new CoinsPHService()
        ]
    }

    getAnchor(name: string): Anchor {
        const anchor = this.anchors.find(anchor => anchor.name === name);
        if (!anchor) {
            throw new Error(`Anchor ${name} not found`);
        }
        return anchor;
    }

    // Get all available anchors for a specific transfer
    async getAvailableAnchors(
        amount: number,
        sourceCurrency: string,
        targetCurrency: string,
        paymentRail: PaymentRail
    ): Promise<Array<{ anchor: Anchor; rate: AnchorRate }>> {
        const availableAnchors = this.anchors.filter(anchor =>
            anchor.supportsTransfer(sourceCurrency, targetCurrency, paymentRail)
        );

        // TODO: add a check to see if the amount is too large for the anchor

        const ratesPromises = availableAnchors.map(async anchor => {
            try {
                console.log('anchor quote', {
                    sourceCurrency,
                    targetCurrency,
                });
                const rate = await anchor.getRate({
                    sourceCurrency,
                    targetCurrency,
                });
                return { anchor, rate };
            } catch (error) {
                console.error(`Failed to get quote from ${anchor.name}:`, error);
                return null;
            }
        });

        const rates = await Promise.all(ratesPromises);

        console.log('rates', rates);

        return rates.filter((rate): rate is { anchor: Anchor; rate: AnchorRate } =>
            rate !== null
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
    ): Promise<{ anchor: Anchor; rate: AnchorRate }> {
        return {
            anchor: this.getAnchor('CoinsPH'),
            rate: {
                exchangeRate: 57.5
            }
        }
        // const availableAnchors = await this.getAvailableAnchors(
        //     amount,
        //     sourceCurrency,
        //     destinationCurrency,
        //     paymentRail
        // );

        // if (availableAnchors.length === 0) {
        //     throw new Error(`No anchors found for ${sourceCurrency} to ${destinationCurrency} on ${paymentRail}`);
        // }

        // // Score each anchor based on preferences
        // const scoredAnchors = availableAnchors.map(({ anchor, rate }): { anchor: Anchor, rate: AnchorRate, score: number } => {
        //     let score = 0;

        //     if (preferences.prioritizeExchangeRate) {
        //         // Higher exchange rate is better
        //         score += rate.exchangeRate * 100;
        //     }

        //     return { anchor, rate, score };
        // });

        // // Sort by score and return the best option
        // scoredAnchors.sort((a, b) => b.score - a.score);


        // if (!scoredAnchors[0]) {
        //     throw new Error(`No anchor found for ${sourceCurrency} to ${destinationCurrency} on ${paymentRail}`);
        // }

        // const { anchor, rate } = scoredAnchors[0];

        // return { anchor, rate };
    }
}