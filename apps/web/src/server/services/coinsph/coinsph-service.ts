import { env } from "@/env";
import axios from 'axios';
import crypto from 'crypto';

interface CoinsPHErrorResponse {
    code: number;
    msg: string;
}

interface CreateInvoiceRequest {
    amount: number;
    currency: string;
    supported_payment_collectors: string[];
    external_transaction_id: string;
    expires_at?: string;
}

interface CreateOrderRequest {
    side: string;
    symbol: string;
    type: string;
    timeInForce: string;
    quantity: number;
    price: number;
    recvWindow: number;
}

interface InvoiceResponse {
    invoice: {
        id: string;
        amount: string;
        amount_due: string;
        currency: string;
        status: 'pending' | 'fully_paid' | 'expired' | 'canceled';
        external_transaction_id: string;
        created_at: string;
        updated_at: string;
        expires_at: string;
        supported_payment_collectors: string;
        payment_url: string;
        expires_in_seconds: string;
        incoming_address: string;
    }
}

export class CoinsPHService {

    public apiUrl = env.COINS_API_URL;

    private get secretKey() {
        return env.COINS_SECRET_KEY;
    }

    private get apiKey() {
        return env.COINS_API_KEY;
    }

    sign(data: string) {
        return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
    }

    get timestamp() {
        return Date.now().toString();
    }


    private parseError(error: any): string {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.json) {
                // Handle CoinsPH specific error format
                const coinsPHError = error.response.data.json as CoinsPHErrorResponse;
                return `CoinsPH Error ${coinsPHError.code}: ${coinsPHError.msg}`;
            }
            // Handle Axios error response
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    return error.response.data;
                }
                // Handle structured error response
                if (error.response.data.msg || error.response.data.message) {
                    return error.response.data.msg || error.response.data.message;
                }
                return JSON.stringify(error.response.data);
            }
            // Handle network errors
            if (error.message) {
                return error.message;
            }
        }
        // Handle non-Axios errors
        return error instanceof Error ? error.message : 'Unknown error occurred';
    }

    async makeSignedRequest<T>(endpoint: string, method: 'GET' | 'POST', params: { [key: string]: string | number | boolean | string[] } = {}): Promise<T> {
        try {
            const timestamp = Date.now().toString();
            const url = `${this.apiUrl}${endpoint}`;

            // Build query string for GET requests or empty string for POST
            const queryString = method === 'GET'
                ? '?' + Object.keys(params)
                    .sort()
                    .map((key) => `${key}=${encodeURIComponent(params[key] as string)}`)
                    .join('&')
                : '';

            // Add timestamp to params
            Object.assign(params, {
                timestamp
            });

            // Build body string for POST requests or empty string for GET
            const bodyString = method === 'POST'
                ? Object.keys(params)
                    .map((key) => `${key}=${params[key]}`)
                    .join('&')
                : '';

            // Construct message according to CoinsPH specification:
            // timestamp + URL(with query params for GET) + BODY(for POST)
            const messageToSign = `${bodyString}`;
            console.log('Message to sign:', messageToSign); // For debugging

            const signature = this.sign(messageToSign);
            console.log('Signature:', signature); // For debugging
            Object.assign(params, {
                signature
            });

            const headers = {
                'X-Merchant-Key': this.apiKey,
                'X-Merchant-Sign': signature,
                'X-COINS-APIKEY': this.apiKey,
                'X-Timestamp': timestamp,
                'Content-Type': 'application/json',
            };

            console.log('headers', headers);
            console.log('params', params);
            const urlWithParams = `${url}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;
            console.log('url', urlWithParams);

            let response;
            if (method === 'GET') {
                const finalUrl = `${url}${queryString}`;
                response = await axios.get(finalUrl, { headers });
            } else {
                response = await axios.post(urlWithParams, {}, { headers });
            }

            if (response?.status !== 200) {
                throw new Error(`Request failed with status ${response?.status}`);
            }

            return response?.data as T;
        } catch (error) {
            const errorMessage = this.parseError(error);
            console.error('Error making request:', errorMessage);
            throw new Error(errorMessage);
        }
    }

    async makeSignedMerchantRequest<T>(endpoint: string, method: 'GET' | 'POST', params: { [key: string]: string | number | boolean | string[] } = {}): Promise<T> {
        try {
            const timestamp = new Date().getTime().toString();


            let str: string[] = []
            Object.entries(params).forEach(([key, value]) => {
                const paramValue = Array.isArray(value) ? JSON.stringify(value) : value;
                str.push(key + "=" + paramValue);
            });


            const stringParams = str.join("&");
            const host = this.apiUrl;
            const messageToSign = timestamp + host + endpoint + stringParams
            const signature = this.sign(messageToSign);


            // Construct message according to CoinsPH specification:
            // timestamp + URL(with query params for GET) + BODY(for POST)

            const headers = {
                'X-Merchant-Key': this.apiKey,
                'X-Merchant-Sign': signature,
                'X-Timestamp': timestamp,
                'Content-Type': 'application/x-www-form-urlencoded',
            };


            let response;
            if (method === 'GET') {
                response = await axios.get(this.apiUrl + endpoint, { headers });
            } else {
                // Convert params to URLSearchParams format for POST requests
                const formData = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    // Special handling for arrays
                    const paramValue = Array.isArray(value) ? JSON.stringify(value) : value;
                    formData.append(key, String(paramValue));
                });
                console.log('formData', formData);

                response = await axios.post(this.apiUrl + endpoint, formData, { headers });
            }

            if (response?.status !== 200) {
                throw new Error(`Request failed with status ${response?.status}`);
            }

            return response?.data as T;
        } catch (error) {
            const errorMessage = this.parseError(error);
            console.error('Error making request:', errorMessage);
            throw new Error(errorMessage);
        }
    }

    async createOrder(params: CreateOrderRequest): Promise<InvoiceResponse> {
        const endpoint = '/openapi/v1/order';

        console.log('createOrder.params', params);

        // TODO: Use Zod to validate schema
        const requestParams = {
            ...params,
        };

        return await this.makeSignedRequest<InvoiceResponse>(
            endpoint,
            'POST',
            requestParams
        );
    }

    async createInvoice(params: CreateInvoiceRequest): Promise<InvoiceResponse> {
        const endpoint = '/merchant-api/v1/invoices';

        console.log('createInvoice.params', params);

        // TODO: Use Zod to validate schema
        const requestParams = {
            ...params,
        };

        return await this.makeSignedMerchantRequest<InvoiceResponse>(
            endpoint,
            'POST',
            requestParams
        );
    }

    async getInvoices(invoiceId: string): Promise<InvoiceResponse> {
        const endpoint = '/merchant-api/v1/get-invoices';


        return await this.makeSignedMerchantRequest<InvoiceResponse>(
            endpoint,
            'GET',
            { invoice_id: invoiceId }
        );
    }

    async getInvoice(invoiceId: string): Promise<InvoiceResponse> {
        const endpoint = `/merchant-api/v1/invoices/${invoiceId}`;
        return await this.makeSignedMerchantRequest<InvoiceResponse>(endpoint, 'GET');
    }

}