import axios from 'axios';
import crypto from 'crypto';
import { Quote, QuoteRequest } from '../shared/interfaces';
import {
    Account,
    CashOutParams,
    CashOutResponse,
    COINS_CASH_OUT_ERRORS,
    COINS_ERRORS,
    FiatOrderDetails,
    FiatOrderHistoryRequest,
    FiatOrderHistoryResponse,
    OrderHistoryRequest,
    OrderHistoryResponse,
    SubAccountDepositAddressRequest,
    SubAccountDepositAddressResponse
} from './coinsph.interfaces';

export class CoinsPHService {


    // Coins.ph API Host
    private get apiHost(): string {
        // Make sure we're using the reverse proxy API gateway
        if (process.env.COINS_REVERSE_PROXY_API_GATEWAY) {
            return process.env.COINS_REVERSE_PROXY_API_GATEWAY;
        }

        if (!process.env.COINS_PH_API_HOST) {
            throw new Error('COINS_PH_API_HOST is not set');
        }
        return process.env.COINS_PH_API_HOST;
    }

    // Coins.ph API Key
    private get apiKey(): string {
        if (!process.env.COINS_PH_API_KEY) {
            throw new Error('COINS_PH_API_KEY is not set');
        }
        return process.env.COINS_PH_API_KEY;
    }

    // Coins.ph API Secret
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

    /**
     * Sign a message
     * @param message - Message to sign
     * @returns Signed message
     */
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

            console.log(queryParams)

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

    /**
     * Accept a quote
     * POST /openapi/convert/v1/accept-quote
     * This endpoint accepts a quote and creates a new order.
     * @param quoteId - ID of the quote to accept
     * @returns Accepted quote
     */
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

    /**
     * Get account information
     * GET /openapi/v1/account
     * This endpoint returns the account information of the user.
     * 
     * @returns Account information
     */
    async getAccount(): Promise<{ success: true; res: Account } | { success: false; error: string }> {
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

            if (response.data.code !== 0) {
                throw new Error(`Error fetching account: ${response.data.msg}`);
            }

            return { success: true, res: response.data };
        } catch (error) {
            console.error('Error fetching account:', error);
            throw error;
        }
    }


    /**
     * Cash out
     * POST /openapi/fiat/v1/cash-out
     * This endpoint allows users to cash out their fiat currency to their bank account.
     * 
     * Weight: 1
     * 
     * Parameters:
     * 
     * Name	Type	Mandatory	Description
     * amount	STRING	YES	Amount to cash out.
     * currency	STRING	YES	Currency to cash out.
     * channelName	STRING	YES	Channel name.
     * channelSubject	STRING	YES	Channel subject.
     * recipientAccountNumber	STRING	YES	Recipient account number.   
     * recipientName	STRING	YES	Recipient name.
     * recipientAddress	STRING	NO	Recipient address.
     * remarks	STRING	NO	Remarks.
     * 
     * @param params 
     * @returns 
     */
    async cashout(params: CashOutParams): Promise<CashOutResponse> {
        try {
            const path = 'openapi/fiat/v1/cash-out';
            const timestamp = Date.now().toString();
            const internalOrderId = Date.now().toString(); // Generate a unique ID based on timestamp

            // Prepare request body
            const requestBody = {
                internalOrderId,
                amount: this.amountGuard(params.amount),
                currency: this.currencyGuard(params.currency),
                channelName: this.channelNameGuard(params.channelName),
                channelSubject: this.channelSubjectGuard(params.channelSubject),
                extendInfo: {
                    recipientAccountNumber: params.recipientAccountNumber,
                    recipientName: params.recipientName,
                    ...(params.recipientAddress && { recipientAddress: params.recipientAddress }),
                    ...(params.remarks && { remarks: params.remarks }),
                    ...(params.recipientMobile && { recipientMobile: params.recipientMobile })
                }
            };

            console.log('requestBody', requestBody);

            const queryParams = new URLSearchParams({ timestamp });
            const messageToSign = `${queryParams.toString()}${JSON.stringify(requestBody)}`;
            const signature = this.signMessage(messageToSign);

            const response = await axios.post(
                `${this.apiHost}/${path}?${queryParams.toString()}`,
                requestBody,
                {
                    headers: {
                        'X-COINS-APIKEY': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    params: { signature }
                }
            );
            console.log('response', response.data);

            if (response.data.status !== 0) {
                this.handleCashoutError(response.data.status, response.data.error);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Guard the amount
     * @param strAmount - Amount to guard
     * @returns Guarded amount
     */
    amountGuard(strAmount: string): string {
        if (process.env.NODE_ENV !== 'production') {
            return "1";
        }
        const amount = Number(strAmount);
        if (Number.isNaN(amount)) {
            throw new Error('Invalid amount');
        }
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        if (Number(amount) > 1000000) {
            throw new Error('Amount must be less than 1,000,000');
        }
        return amount.toString();
    }

    /**
     * Guard the currency
     * @param currency - Currency to guard
     * @returns Guarded currency
     */
    currencyGuard(currency: string): string {
        if (currency !== 'PHP') {
            throw new Error('Currency must be PHP');
        }
        return currency;
    }

    /**
     * Guard the channel name
     * @param channelName - Channel name to guard
     * @returns Guarded channel name
     */
    channelNameGuard(channelName: string): string {
        const upperCaseChannelName = channelName.toUpperCase();
        if (upperCaseChannelName !== 'INSTAPAY' && upperCaseChannelName !== 'SWIFTPAY_PESONET') {
            throw new Error('Invalid channel name');
        }
        return upperCaseChannelName;
    }

    /**
     * Guard the channel subject
     * @param channelSubject - Channel subject to guard
     * @returns Guarded channel subject
     */
    channelSubjectGuard(channelSubject: string): string {
        const availableChannelSubjects = ['gcash', 'coins.ph']
        if (!availableChannelSubjects.includes(channelSubject)) {
            throw new Error('Invalid channel subject');
        }
        return channelSubject;
    }

    /**
     * Handle cash-out error
     * @param errorCode - Error code
     * @param errorMessage - Error message
     * @returns Never
     */
    private handleCashoutError(errorCode: number, errorMessage?: string): never {
        // Handle specific error cases
        switch (errorCode) {
            case COINS_CASH_OUT_ERRORS.ACCOUNT_DISABLED:
                throw new Error('Account disabled. Please contact support.');
            case COINS_CASH_OUT_ERRORS.AMOUNT_TOO_LOW:
                throw new Error('Amount is below minimum limit.');
            case COINS_CASH_OUT_ERRORS.AMOUNT_TOO_HIGH:
                throw new Error('Amount exceeds maximum limit.');
            case COINS_CASH_OUT_ERRORS.DAILY_LIMIT_EXCEEDED:
                throw new Error('Daily cash-out limit exceeded.');
            case COINS_CASH_OUT_ERRORS.MONTHLY_LIMIT_EXCEEDED:
                throw new Error('Monthly cash-out limit exceeded.');
            case COINS_CASH_OUT_ERRORS.ANNUAL_LIMIT_EXCEEDED:
                throw new Error('Annual cash-out limit exceeded.');
            case COINS_CASH_OUT_ERRORS.INSUFFICIENT_BALANCE:
                throw new Error('Insufficient balance.');
            case COINS_CASH_OUT_ERRORS.PHONE_REQUIRED:
                throw new Error('Phone number binding required.');
            case COINS_CASH_OUT_ERRORS.SERVER_ERROR:
                throw new Error('Server error. Please contact support.');
        }

        // Handle ranges
        if (errorCode >= COINS_CASH_OUT_ERRORS.METHOD_UNAVAILABLE_START &&
            errorCode <= COINS_CASH_OUT_ERRORS.METHOD_UNAVAILABLE_END) {
            throw new Error('Cash-out method currently unavailable.');
        }

        if ((errorCode >= COINS_CASH_OUT_ERRORS.KYC_REQUIRED_START &&
            errorCode <= COINS_CASH_OUT_ERRORS.KYC_REQUIRED_END) ||
            errorCode === COINS_CASH_OUT_ERRORS.KYC_REQUIRED_ADDITIONAL) {
            throw new Error('KYC verification required.');
        }

        // Default error case
        throw new Error(`Error processing cash out: ${errorMessage}`);
    }

    /**
     * Retrieve details about a specific fiat order
     * @param internalOrderId - ID of the order to retrieve details for
     * @returns Details about the fiat order
     */
    async getFiatOrderDetails(internalOrderId: string): Promise<{ success: true; res: FiatOrderDetails } | { success: false; error: string }> {
        try {
            const path = 'openapi/fiat/v1/details';
            const timestamp = Date.now().toString();

            const queryParams = new URLSearchParams({
                internalOrderId,
                timestamp,
            });

            const messageToSign = queryParams.toString();
            const signature = this.signMessage(messageToSign);

            const response = await axios.get(`${this.apiHost}/${path}`, {
                params: {
                    ...Object.fromEntries(queryParams),
                    signature
                },
                headers: {
                    'X-COINS-APIKEY': this.apiKey
                }
            });

            if (response.data.status !== 0) {
                throw new Error(`Error fetching order details: ${response.data.error}`);
            }

            return {
                success: true,
                res: response.data.data
            }
        } catch (error) {
            console.error('Error fetching fiat order details:', error);
            throw error;
        }
    }

    /**
     * Query fiat order history with various filters
     * @param params - Optional parameters to filter the history
     * @returns List of fiat orders and total count
     */
    async getFiatOrderHistory(params: FiatOrderHistoryRequest = {}): Promise<FiatOrderHistoryResponse> {
        try {
            const path = 'openapi/fiat/v2/history';
            const timestamp = Date.now().toString();

            // Remove undefined values from params
            const cleanedParams = Object.fromEntries(
                Object.entries(params).filter(([_, value]) => value !== undefined)
            );

            const queryParams = new URLSearchParams({ timestamp });
            const messageToSign = `${queryParams.toString()}${JSON.stringify(cleanedParams)}`;
            const signature = this.signMessage(messageToSign);

            const response = await axios.post(
                `${this.apiHost}/${path}?${queryParams.toString()}`,
                cleanedParams,
                {
                    headers: {
                        'X-COINS-APIKEY': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    params: { signature }
                }
            );

            if (response.data.status !== 0) {
                throw new Error(`Error fetching order history: ${response.data.error}`);
            }

            return {
                data: response.data.data,
                total: response.data.total
            };
        } catch (error) {
            console.error('Error fetching fiat order history:', error);
            throw error;
        }
    }

    /**
     * Query order history
     * POST /openapi/convert/v1/query-order-history
     * This endpoint retrieves order history with optional time period filters
     * 
     * @param params - Optional parameters to filter the history
     * @returns List of orders and total count
     */
    async getOrderHistory(params: OrderHistoryRequest = {}): Promise<OrderHistoryResponse> {
        try {
            const path = 'openapi/convert/v1/query-order-history';
            const timestamp = Date.now().toString();

            // Remove undefined values from params
            const cleanedParams = Object.fromEntries(
                Object.entries(params).filter(([_, value]) => value !== undefined)
            );

            const queryParams = new URLSearchParams({ timestamp });
            const messageToSign = `${queryParams.toString()}${JSON.stringify(cleanedParams)}`;
            const signature = this.signMessage(messageToSign);

            const response = await axios.post(
                `${this.apiHost}/${path}?${queryParams.toString()}`,
                cleanedParams,
                {
                    headers: {
                        'X-COINS-APIKEY': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    params: { signature }
                }
            );

            if (response.data.status !== 0) {
                throw new Error(`Error fetching order history: ${response.data.error}`);
            }

            return {
                data: response.data.data,
                total: response.data.total
            };
        } catch (error) {
            console.error('Error fetching order history:', error);
            throw error;
        }
    }

    /**
     * Get Sub-account Deposit Address (For Master Account)
     * GET /openapi/v1/sub-account/wallet/deposit/address
     * Fetch sub account deposit address with network.
     * 
     * @param params - Parameters to specify the sub-account and coin details
     * @returns Deposit address information
     */
    async getSubAccountDepositAddress(params: SubAccountDepositAddressRequest): Promise<SubAccountDepositAddressResponse> {
        try {
            const path = 'openapi/v1/sub-account/wallet/deposit/address';
            const timestamp = Date.now().toString();

            // Create the parameter string directly (similar to the Postman implementation)
            const paramString = `coin=${params.coin}&email=${params.email}&network=${params.network}&recvWindow=60000&timestamp=${timestamp}`;

            // Sign the raw parameter string
            const signature = this.signMessage(paramString);

            // Construct the full URL with parameters and signature
            const url = `${this.apiHost}/${path}?${paramString}&signature=${signature}`;

            const response = await axios.get(url, {
                headers: {
                    'X-COINS-APIKEY': this.apiKey
                }
            });
            console.log('response', response.data);
            if (response.data.status !== 0) {
                if (response.data.code === COINS_ERRORS.INVALID_SIGNATURE) {
                    throw new Error(`Invalid signature`);
                }
                throw new Error(`Error fetching deposit address: ${response.data.error}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching sub-account deposit address:', error);
            throw error;
        }
    }

}
