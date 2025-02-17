import axios from 'axios';
import crypto from 'crypto';
import { Anchor } from '../shared';
import { AnchorQuote, AnchorRate, CashoutParams, GetQuoteParams, PaymentRail, QuoteParams } from '../shared/interfaces';
import {
    Account,
    CashOutParams,
    CashOutResponse,
    COINS_CASH_OUT_ERRORS,
    COINS_ERRORS,
    CoinsPHQuote,
    CoinsResponse,
    FiatOrderDetails,
    FiatOrderHistoryRequest,
    FiatOrderHistoryResponse,
    OrderHistoryRequest,
    OrderHistoryResponse,
    SubAccountDepositAddressRequest,
    SubAccountDepositAddressResponse
} from './coinsph.interfaces';

export class CoinsPHService extends Anchor {
    name = "CoinsPH";
    supportedPaymentRails = [PaymentRail.CRYPTO];
    supportedCurrencies = ["USDC", "EURC", "PHP"];

    private readonly useProxy: boolean;

    constructor() {
        super();
        this.useProxy = process.env.USE_COINS_PH_PROXY === 'true';
        if (this.useProxy) {
            console.log('Using Coins.ph through Proxy');
        }
    }

    // Coins.ph API Host
    private get apiHost(): string {
        // Make sure we're using the reverse proxy API gateway
        if (this.useProxy && process.env.COINS_PH_PROXY_API_HOST) {
            return process.env.COINS_PH_PROXY_API_HOST;
        }

        if (!process.env.COINS_PH_API_HOST) {
            throw new Error('COINS_PH_API_HOST is not set');
        }
        return process.env.COINS_PH_API_HOST;
    }

    // Coins.ph API Key
    private get apiKey(): string {
        if (this.useProxy && process.env.COINS_PH_PROXY_API_KEY) {
            return process.env.COINS_PH_PROXY_API_KEY;
        }
        if (!process.env.COINS_PH_API_KEY) {
            throw new Error('COINS_PH_API_KEY is not set');
        }
        return process.env.COINS_PH_API_KEY;
    }

    // Coins.ph API Secret
    private get apiSecret(): string {
        if (this.useProxy && process.env.COINS_PH_PROXY_API_SECRET) {
            return process.env.COINS_PH_PROXY_API_SECRET;
        }
        if (!process.env.COINS_PH_API_SECRET) {
            throw new Error('COINS_PH_API_SECRET is not set');
        }
        return process.env.COINS_PH_API_SECRET;
    }

    get fee(): string {
        return "0.05";
    }

    // PHP markup
    get markup(): number {
        return 0.2; // +0.20 PHP markup
    }

    test() {
        console.log('Hello from CoinsPHService!!');
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

    supportsTransfer(sourceCurrency: string, destinationCurrency: string, paymentRail: PaymentRail): boolean {
        if (!this.supportedPaymentRails.includes(paymentRail)) {
            return false;
        }
        const supportedPairs = {
            'USDC': ['PHP'],
            'EURC': ['PHP'],
            'PHP': ['USDC', 'EURC']
        }
        return supportedPairs[sourceCurrency as keyof typeof supportedPairs]?.includes(destinationCurrency);
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
    async requestQuote(params: GetQuoteParams): Promise<AnchorQuote> {
        try {

            const { sourceCurrency, targetCurrency, ...amountConfig } = params;
            const timestamp = Date.now().toString();
            const path = 'openapi/convert/v1/get-quote';

            let messageToSign = '';

            // Add source amount if it exists
            if ('sourceAmount' in amountConfig) {
                messageToSign += `sourceAmount=${amountConfig.sourceAmount}`;
            }
            // Add source currency if it exists
            messageToSign += `&sourceCurrency=${sourceCurrency}`;

            // Add target amount if it exists
            if ('targetAmount' in amountConfig) {
                messageToSign += `&targetAmount=${amountConfig.targetAmount}`;
            }

            // Add target currency if it exists and timestamp
            messageToSign += `&targetCurrency=${targetCurrency}&timestamp=${timestamp}`;
            console.log('messageToSign before slice', messageToSign);
            if (messageToSign.startsWith('&')) {
                messageToSign = messageToSign.slice(1);
            }
            console.log('messageToSign after slice', messageToSign);
            const signature = this.signMessage(messageToSign);

            const url = `${this.apiHost}/${path}?${messageToSign}&signature=${signature}`;
            console.log('url', url);
            console.log('apiKey', this.apiKey);

            const response = await axios.post<CoinsResponse<CoinsPHQuote>>(url, null, {
                headers: {
                    'X-COINS-APIKEY': `${this.apiKey}`
                }
            })

            console.log('response from coinsph', response.data);
            if ('status' in response.data && response.data.status !== 0) {
                if (response.data.status === COINS_ERRORS.INSUFFICIENT_BALANCE) {
                    throw new Error('Insufficient balance');
                } else if (response.data.status === COINS_ERRORS.INVALID_SIGNATURE) {
                    throw new Error('Invalid signature');
                }
                if ('error' in response.data) {
                    throw new Error(`Error fetching quote: ${response?.data?.error}`);
                }
                throw new Error(`Error fetching quote`);
            }
            if (!('data' in response.data)) {
                throw new Error('Error fetching quote');
            }
            const data = response.data.data;
            return {
                quoteId: data?.quoteId,
                fee: this.fee,
                exchangeRate: Number(data?.price),
                expiresIn: Number(data?.expiry ?? 0),
                sourceCurrency,
                targetCurrency,
                sourceAmount: data.sourceAmount ?? amountConfig.sourceAmount ?? "0",
                targetAmount: data.targetAmount ?? amountConfig.targetAmount ?? "0",
                total: "0" // TODO: Calculate total
            }
        } catch (error) {
            console.error((error as Error)?.message ?? 'Error fetching quote:', error);
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
    // TODO: movi todo esta intefaz
    async acceptQuote(quoteId: string): Promise<{ success: true; res: CoinsPHQuote } | { success: false; error: string }> {
        try {
            const path = 'openapi/convert/v1/accept-quote';
            const timestamp = Date.now().toString();
            const messageToSign = `quoteId=${quoteId}&timestamp=${timestamp}`;
            const signature = this.signMessage(messageToSign);
            const response = await axios.post(`${this.apiHost}/${path}?${messageToSign}&signature=${signature}`, null, {
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
            console.error('Error accepting quote:', (error as Error)?.message ?? 'Unknown error');
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

            return { success: true, res: response.data };
        } catch (error) {
            console.error('Error fetching account:', error);
            throw error;
        }
    }

    /**
     * Get live fx rate for a specific trading pair
     * GET /openapi/quote/v1/ticker/price
     * This endpoint returns the live fx rate for a specific trading pair.
     * NOTE: This should include our actual Markup (PHP markup)
     * @param params - Quote parameters
     * @returns Live fx rate
     */
    async getRate(params: QuoteParams): Promise<AnchorRate> {
        try {
            const path = 'openapi/quote/v1/ticker/price';
            const queryParams = new URLSearchParams({
                symbol: `${params.sourceCurrency}${params.targetCurrency}`,
            });
            const messageToSign = queryParams.toString();
            const signature = this.signMessage(messageToSign);
            const response = await axios.get(`${this.apiHost}/${path}`, {
                params: {
                    ...Object.fromEntries(queryParams),
                    signature
                },
                headers: { 'X-COINS-APIKEY': `${this.apiKey}` }
            });
            if (response.data.code === -100011) {
                throw new Error('Unsupported currency pair');
            }
            const exchangeRate = Number(response.data.price); // + this.markup;
            console.log('exchangeRate', exchangeRate);

            return {
                exchangeRate,
                expiresIn: Number(response.data.expiry ?? 0)
            };
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

            console.log('params', params)

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

            console.log('messageToSign', messageToSign)

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
        const availableChannelSubjects = ['PH_GCASH', 'PH_MAYA', 'PH_COINS_PH']
        if (!availableChannelSubjects.includes(channelSubject)) {
            throw new Error('Invalid channel subject');
        }
        let channelSubjectName = channelSubject;
        switch (channelSubject) {
            case 'PH_GCASH':
                channelSubjectName = 'gcash';
            case 'PH_MAYA':
                channelSubjectName = 'maya';
            case 'PH_COINS_PH':
                channelSubjectName = 'coins.ph';
        }
        return channelSubjectName;
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

    /**
     * Request a cash-out operation
     * This method implements the abstract requestCashout method from the base Anchor class
     */
    async requestCashout(params: CashoutParams): Promise<CashOutResponse> {
        console.log('params', params)
        // Map the generic cashout params to Coins.ph specific params
        const coinsCashoutParams: CashOutParams = {
            amount: params.targetAmount.toString(),
            currency: params.targetCurrency,
            channelName: this.getChannelNameFromProvider(params.recipientDetails.ewalletProvider),
            channelSubject: params.recipientDetails.ewalletProvider ?? 'coins.ph',
            recipientAccountNumber: params.recipientDetails.accountNumber,
            recipientName: params.recipientDetails.name,
            recipientAddress: '', // Optional in Coins.ph
            recipientMobile: params.recipientDetails.mobileNumber,
        };

        // Call the existing cashout method
        return this.cashout(coinsCashoutParams);
    }

    /**
     * Helper method to map e-wallet provider to Coins.ph channel name
     */
    private getChannelNameFromProvider(provider?: string): "INSTAPAY" | "SWIFTPAY_PESONET" {
        switch (provider?.toUpperCase()) {
            case 'PH_GCASH':
                return "INSTAPAY";
            case 'PH_MAYA':
                return "INSTAPAY";
            case 'PH_COINS_PH':
                return "INSTAPAY";
            default:
                return "SWIFTPAY_PESONET"; // Default to PESONet for bank transfers
        }
    }

    async getLiquidationAddress(): Promise<string> {
        // if (process.env.NODE_ENV !== 'production') {
        //     return "GDLS6OIZ3TOC7NXHB3OZKHXLUEZV4EUANOMOOMOHUZAZHLLGNN43IALX";
        // }
        const path = '/openapi/wallet/v1/deposit/address';
        const timestamp = Date.now().toString();
        const coin = 'USDC';
        const network = 'XLM';
        const queryParams = new URLSearchParams({ coin, network, timestamp });
        const messageToSign = queryParams.toString();

        const signature = this.signMessage(messageToSign);

        const url = `${this.apiHost}/${path}?${messageToSign}&signature=${signature}`;
        const response = await axios.get(url, {
            headers: {
                'X-COINS-APIKEY': this.apiKey
            }
        });

        console.log('response', response.data);

        if (response.data?.address && typeof response.data.address === 'string' && response.data.address?.length > 0) {
            return response.data.address;
        }

        throw new Error(`Error fetching liquidation address: ${response.data.error}`);
    }

    async convertCurrency(
        sourceCurrency: string,
        destinationCurrency: string,
        sourceAmount: number,
        expectedTargetAmount: number,
    ): Promise<number> {
        console.log(`Will convert ${sourceAmount} ${sourceCurrency} to ${expectedTargetAmount} ${destinationCurrency}`);
        const quote = await this.requestQuote({
            sourceCurrency: sourceCurrency.toString(),
            targetCurrency: destinationCurrency.toString(),
            targetAmount: expectedTargetAmount.toString()
        });
        console.log(`Quote: ${JSON.stringify(quote)}`);
        // Positive: we're eating the difference, Negative: we're making money
        const sourceAmountDifference = Number(quote.sourceAmount) - sourceAmount;
        console.log(`Source amount difference: ${sourceAmountDifference}`);
        if (sourceAmountDifference > this.AMOUNT_WE_MAY_EAT_AS_A_COMPANY_TO_HAVE_CUSTOMERS_HAPPY) {
            throw new Error(`Source amount difference of ${sourceAmountDifference} is greater than the maximum allowed amount of ${this.AMOUNT_WE_MAY_EAT_AS_A_COMPANY_TO_HAVE_CUSTOMERS_HAPPY}`);
        }
        console.log(`Accepting quote ${quote.quoteId}`);
        await this.acceptQuote(quote.quoteId);
        return sourceAmountDifference;
    }

    readonly AMOUNT_WE_MAY_EAT_AS_A_COMPANY_TO_HAVE_CUSTOMERS_HAPPY = 20;
}
