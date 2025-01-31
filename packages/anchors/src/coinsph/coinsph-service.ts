import axios from 'axios';
import crypto from 'crypto';
import { Quote, QuoteRequest } from '../shared/interfaces';
import { Account, CashOutRequest, COINS_ERRORS } from './coinsph-interfaces';

export class CoinsPHService {

    private get apiHost(): string {
        if (!process.env.COINS_PH_API_HOST) {
            throw new Error('COINS_PH_API_HOST is not set');
        }
        return process.env.COINS_PH_API_HOST;
    }

    private get apiKey(): string {
        if (!process.env.COINS_PH_API_KEY) {
            throw new Error('COINS_PH_API_KEY is not set');
        }
        return process.env.COINS_PH_API_KEY;
    }

    private get apiSecret(): string {
        if (!process.env.COINS_PH_API_SECRET) {
            throw new Error('COINS_PH_API_SECRET is not set');
        }
        return process.env.COINS_PH_API_SECRET;
    }

    test() {
        console.log('Hello from CoinsPHService!!');
        console.log('apiHost', this.apiHost);
        console.log('apiKey', this.apiKey);
    }

    signMessage(message: string) {
        const signature = crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
        return signature;
    }

    /**
     * Fetch a quote (TRADE)
     * POST /openapi/convert/v1/get-quote
     * This endpoint returns a quote for a specified source currency (sourceCurrency) and target currency (targetCurrency) pair.
     * 
     * Weight: 1
     * 
     * Parameters:
     * 
     * Name	Type	Mandatory	Description
     * sourceCurrency	STRING	YES	The currency the user holds
     * targetCurrency	STRING	YES	The currency the user would like to obtain
sourceAmount	STRING	NO	The amount of sourceCurrency. You only need to fill in either the source amount or the target amount. If both are filled, it will result in an error.
     * targetAmount	STRING	NO	The amount of targetCurrency. You only need to fill in either the source amount or the target amount. If both are filled, it will result in an error.
     * 
     * Response:
     * 
     * Field name	Description
     * quoteId	Quote unique id.
     * sourceCurrency	Source token.
     * targetCurrency	Target token.
     * sourceAmount	Source token amount.
price	Trading pairs price.
targetAmount	Targe token amount.
expiry	Quote expire time seconds.
{
  "status": 0, 
  "error": "OK", 
  "data": {
            "quoteId": "2182b4fc18ff4556a18332245dba75ea",
            "sourceCurrency": "BTC",
            "targetCurrency": "PHP",
            "sourceAmount": "0.1",
            "price": "59999",             //1BTC=59999PHP
            "targetAmount": "5999",       //The amount of PHP the user holds
            "expiry": "10"
  }
}
     */
    async getQuote(params: QuoteRequest): Promise<{ success: true; res: Quote } | { success: false; error: string }> {
        try {
            const { sourceCurrency, targetCurrency, sourceAmount, targetAmount } = params;
            const timestamp = Date.now().toString();
            const queryParams = new URLSearchParams({
                sourceCurrency,
                targetCurrency,
                timestamp,
                ...(sourceAmount && { sourceAmount }),
                ...(targetAmount && { targetAmount }),
            });

            const path = 'openapi/convert/v1/get-quote';

            const messageToSign = queryParams.toString();
            const signature = this.signMessage(messageToSign);

            const response = await axios.post(`${this.apiHost}/${path}`, null, {
                params: {
                    ...Object.fromEntries(queryParams),
                    signature
                },
                headers: {
                    'X-COINS-APIKEY': `${this.apiKey}`
                }
            })

            if (response.data.status !== 0) {
                if (response.data.status === COINS_ERRORS.INSUFFICIENT_BALANCE) {
                    return { success: false, error: 'Insufficient balance' };
                }
                throw new Error(`Error fetching quote: ${response?.data?.error}`);
            }
            return { success: true, res: response.data.data };
        } catch (error) {
            console.error('Error fetching quote:', error);
            throw error;
        }
    }

    async acceptQuote(quoteId: string): Promise<{ success: true; res: Quote } | { success: false; error: string }> {
        try {
            const path = 'openapi/convert/v1/accept-quote';
            const timestamp = Date.now().toString();
            const queryParams = new URLSearchParams({ quoteId, timestamp });
            const messageToSign = queryParams.toString();
            const signature = this.signMessage(messageToSign);
            const response = await axios.post(`${this.apiHost}/${path}`, null, {
                params: {
                    ...Object.fromEntries(queryParams),
                    signature
                },
                headers: { 'X-COINS-APIKEY': `${this.apiKey}` }
            });
            console.log('response', response.data);

            if (response.data.status !== 0) {
                if (response.data.status === COINS_ERRORS.INSUFFICIENT_BALANCE) {
                    return { success: false, error: 'Insufficient balance' };
                }
                throw new Error(`Error accepting quote: ${response?.data?.error}`);
            }
            return { success: true, res: response.data.data };
        } catch (error) {
            console.error('Error accepting quote:', error);
            throw error;
        }
    }

    async getAccount() {
        try {
            const path = 'openapi/v1/account';
            const timestamp = Date.now().toString();
            const queryParams = new URLSearchParams({
                timestamp,
            });
            const messageToSign = queryParams.toString();
            const signature = this.signMessage(messageToSign);
            const response = await axios.get<Account>(`${this.apiHost}/${path}`, {
                params: {
                    ...Object.fromEntries(queryParams),
                    signature
                },
                headers: { 'X-COINS-APIKEY': `${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching account:', error);
            throw error;
        }
    }

    async cashOut(params: CashOutRequest) {
        const path = 'openapi/v1/cash-out';
        const timestamp = Date.now().toString();
        const queryParams = new URLSearchParams({
            timestamp,
        });

        const messageToSign = queryParams.toString();
        const signature = this.signMessage(messageToSign);
        const response = await axios.post(`${this.apiHost}/${path}`, null, {
            params: {
                ...Object.fromEntries(queryParams),
                signature
            },
            headers: { 'X-COINS-APIKEY': `${this.apiKey}` }
        });
        return response.data;
    }
}
