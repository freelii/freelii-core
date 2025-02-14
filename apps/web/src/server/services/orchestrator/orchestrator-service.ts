import {
    AnchorService,
    PaymentRail,
    type GetQuoteParams
} from '@freelii/anchors';
import { BaseService } from '@services/base-service';

export class OrchestratorService extends BaseService {

    /**
     * Get a quote for a given source and target currency, through the best anchor
     * @param sourceCurrency - The source currency
     * @param targetCurrency - The target currency
     * @returns The quote
     */
    async getRate({ sourceCurrency, targetCurrency, ...amountConfig }: GetQuoteParams) {
        const anchorService = new AnchorService();
        let amount: number | undefined;
        if ('sourceAmount' in amountConfig) {
            amount = Number(amountConfig.sourceAmount);
        } else if ('targetAmount' in amountConfig) {
            amount = Number(amountConfig.targetAmount);
        }
        if (!amount) {
            throw new Error('Amount is required');
        }
        return anchorService.getOptimalAnchor(
            amount,
            sourceCurrency,
            targetCurrency,
            PaymentRail.CRYPTO
        );
    }

}