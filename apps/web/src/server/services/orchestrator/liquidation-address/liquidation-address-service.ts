import { BaseService } from '@services/base-service';

/*
 * NOTE: A Liquidation Address is a blockchain address that is used to send money to a user.
 * Destination can either be a crypto address or a bank account address.
 */

export class LiquidationAddressService extends BaseService {
    async getLiquidationAddress(userId: string, chain: string, currency: string, address: string, destinationPaymentRail: PaymentRail, destinationCurrency: string, destinationAddress?: string) {
        const liquidationAddress = await this.prisma.liquidationAddress.findFirst({
            where: {
                userId,
            },
        });
    }
}
