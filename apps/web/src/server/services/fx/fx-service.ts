import { CoinsPHService } from "@freelii/anchors";
export class FxService {

    async getFxForTarget(params:
        {
            sourceCurrency: string,
            targetCurrency: string,
            targetAmount: number
        }) {
        const anchorService = new CoinsPHService();
        const fxRates = await anchorService.getQuote({
            sourceCurrency: params.sourceCurrency,
            targetCurrency: params.targetCurrency,
            targetAmount: params.targetAmount.toString(),
        });
        return fxRates;
    }

    async getFxForSource(params:
        {
            sourceCurrency: string,
            targetCurrency: string,
            sourceAmount: number
        }) {
        const anchorService = new CoinsPHService();
        const fxRates = await anchorService.getQuote({
            sourceCurrency: params.sourceCurrency,
            targetCurrency: params.targetCurrency,
            sourceAmount: params.sourceAmount.toString(),
        });
        return fxRates;
    }
}