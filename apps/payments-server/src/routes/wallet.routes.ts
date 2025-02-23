import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { validateRequest } from '../middleware/validate-request';
import { createWalletRequestSchema } from '../schemas/wallet.schema';

const router: Router = Router();
const walletController = new WalletController();

// router.use(authenticate);

// Get all wallets for a user
router.get('/', walletController.getWallets);

// Create a new wallet
router.post(
    '/',
    validateRequest(createWalletRequestSchema),
    walletController.createWallet
);

// Get wallet details
router.get('/:walletId', walletController.getWallet);

// Get wallet balance
router.get('/:walletId/balance', walletController.getWalletBalance);

router.post('/:walletId/transfer', walletController.transfer);


export const walletRoutes = router; 