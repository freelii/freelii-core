import { NextFunction, Request, Response } from 'express';
import { CreateWalletDto } from '../dtos/wallet.dto';
import { ApiError } from '../middleware/error-handler';
import { WalletService } from '../services/wallet.service';

export class WalletController {
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
    }

    getWallets = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = "user-1" // req.user?.id;
            // if (!userId) {
            //     throw new ApiError(401, 'Unauthorized');
            // }
            const wallets = await this.walletService.getWallets(userId!);
            res.json({ success: true, data: wallets });
        } catch (error) {
            next(error);
        }
    };

    createWallet = async (
        req: Request<any, any, CreateWalletDto>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = "user-1" // req.user?.id;
            const walletData = req.body;
            const wallet = await this.walletService.createWallet(userId!, walletData);
            res.status(201).json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    };

    getWallet = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = "user-1" // req.user?.id;
            const walletId = req.params.walletId!;
            const wallet = await this.walletService.getWallet(userId!, walletId);

            if (!wallet) {
                throw new ApiError(404, 'Wallet not found');
            }

            res.json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    };

    getWalletBalance = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = "user-1" // req.user?.id;
            const walletId = req.params.walletId;
            const balanceDetails = await this.walletService.getWalletBalance(userId!, walletId!);
            console.log('balanceDetails:', balanceDetails);
            if (!balanceDetails) {
                throw new ApiError(404, 'Wallet not found');
            }

            res.json({
                success: true,
                data: {
                    confirmedBalance: balanceDetails.confirmedBalance, // USD balance from Circle
                    pendingCredits: balanceDetails.pendingCredits, // USDC credits pending to be reflected on-chain
                    totalBalance: balanceDetails.totalBalance, // Sum of confirmed balance and pending credits
                }
            });
        } catch (error) {
            next(error);
        }
    };

    transfer = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = "user-1" // req.user?.id;
            const walletId = req.params.walletId;
            const transferData = req.body;
            const transfer = await this.walletService.transfer(userId!, walletId!, transferData);
            res.json({ success: true, data: transfer });
        } catch (error) {
            next(error);
        }
    };
} 