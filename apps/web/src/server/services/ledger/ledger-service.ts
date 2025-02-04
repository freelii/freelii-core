import { BaseService, BaseServiceOptions } from "../base-service";
import { StellarService } from "../stellar/stellar-service";

interface LedgerServiceOptions extends BaseServiceOptions {
    walletId: string;
}

export class LedgerService extends BaseService {
    readonly walletId: string;


    constructor(options: LedgerServiceOptions) {
        const { walletId, ...baseOptions } = options;
        super(baseOptions);
        this.walletId = walletId;
    }

    async getTransactions() {
        const wallet = await this.db.wallet.findUniqueOrThrow({ where: { id: this.walletId } });
        console.log('ledger.wallet', wallet);
        if (wallet.network === "stellar") {
            const stellar = new StellarService({ wallet });
            return stellar.getTransactions();
        }
        return [];
    }
}