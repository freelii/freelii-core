import {
    EwalletProvider,
    FiatAccountType,
    PaymentRail,
    TransferMethod
} from "@prisma/client";
import { BaseService } from "../base-service";
import { type CreateAccountParams } from "./schemas/create-account.schema";

export class PaymentAccountService extends BaseService {

    /**
     * Create a payment account
     * @param params - The parameters for creating a payment account
     */
    async createPaymentAccount(
        params: CreateAccountParams,
        clientId: number
    ) {
        const { paymentMethod, country } = params;


        if (paymentMethod === 'fiat') {
            if (!params.accountNumber) {
                throw new Error('Missing required fields for fiat account');
            }

            const fiatAccount = await this.db.fiatAccount.create({
                data: {
                    account_number: params.accountNumber,
                    account_holder_name: params.accountHolderName,
                    bank_name: params.bankName,
                    alias: this.buildAlias(params.bankName ?? 'Bank', this.getAccountType(params.accountType)),
                    account_type: this.getAccountType(params.accountType),
                    iso_currency: this.getCurrency(country),
                    transfer_method: this.getTransferMethod(params.transferMethod),
                    client_id: clientId,
                    // TODO: Map country to bank address, city, state, zip
                }
            });

            await this.db.paymentDestination.create({
                data: {
                    client_id: clientId,
                    payment_rail: this.getPaymentRail(country, paymentMethod, params.transferMethod),
                    currency: this.getCurrency(country),
                    fiat_account_id: fiatAccount.id,
                    is_default: true,
                }
            });
        }
        else if (paymentMethod === 'blockchain') {
            if (!params.walletAddress) {
                throw new Error('Missing required fields for blockchain account');
            }

            const blockchainAccount = await this.db.blockchainAccount.create({
                data: {
                    address: params.walletAddress,
                    network: 'stellar',
                    environment: 'testnet', // TODO: Make this dynamic
                    client_id: clientId,
                }
            });

            await this.db.paymentDestination.create({
                data: {
                    client_id: clientId,
                    payment_rail: PaymentRail.STELLAR,
                    currency: 'USDC',
                    blockchain_account_id: blockchainAccount.id,
                    is_default: true,
                }
            });
        }
        else if (paymentMethod === 'ewallet') {
            if (!params.ewalletProvider || !params.mobileNumber) {
                throw new Error('Missing required fields for ewallet account');
            }

            const ewalletAccount = await this.db.ewalletAccount.create({
                data: {
                    account_number: params.accountNumber,
                    iso_currency: 'PHP',
                    mobile_number: params.mobileNumber,
                    ewallet_provider: params.ewalletProvider === 'gcash'
                        ? EwalletProvider.PH_GCASH
                        : params.ewalletProvider === 'maya'
                            ? EwalletProvider.PH_MAYA
                            : EwalletProvider.PH_COINS_PH,
                    client_id: clientId,
                }
            });

            await this.db.paymentDestination.create({
                data: {
                    client_id: clientId,
                    payment_rail: PaymentRail.PH_INSTAPAY,
                    currency: 'PHP',
                    ewallet_account_id: ewalletAccount.id,
                    is_default: true,
                }
            });
        }
    }

    getCurrency(country: string) {
        return {
            'Philippines': 'PHP',
            'Mexico': 'MXN',
            'United States': 'USD'
        }[country] ?? 'USDC';
    }

    getAccountType(accountType?: string): FiatAccountType {
        return accountType === 'checking' ? FiatAccountType.CHECKING : FiatAccountType.SAVINGS;
    }

    buildAlias(bankName: string, accountType: FiatAccountType) {
        return `${bankName} ${accountType === FiatAccountType.CHECKING ? 'Checking' : 'Savings'} Account`;
    }

    getTransferMethod(transferMethod?: string): TransferMethod | undefined {
        return transferMethod === 'instapay'
            ? TransferMethod.PH_INSTAPAY
            : transferMethod === 'pesonet'
                ? TransferMethod.PH_PESONET
                : undefined;
    }

    getPaymentRail(country: string, paymentMethod: string, transferMethod?: string): PaymentRail {
        if (paymentMethod === 'blockchain') {
            return PaymentRail.STELLAR;
        }

        if (country === 'Philippines') {
            if (paymentMethod === 'fiat') {
                if (transferMethod === 'instapay') {
                    return PaymentRail.PH_INSTAPAY;
                }
                else if (transferMethod === 'pesonet') {
                    return PaymentRail.PH_PESONET;
                }
            }
            else if (paymentMethod === 'ewallet') {
                return PaymentRail.PH_INSTAPAY;
            }
        } else if (country === 'Mexico' && paymentMethod === 'fiat') {
            return PaymentRail.MX_SPEI;
        }
        else if (country === 'United States' && paymentMethod === 'fiat') {
            return PaymentRail.WIRE;
        }
        return PaymentRail.WIRE;
    }
}