import { WalletService } from "@/server/services/wallet/wallet-service";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const walletRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const wallets = await ctx.db.wallet.findMany({
            where: {
                userId: Number(ctx.session.user.id),
            },
            include: {
                balances: true,
                mainBalance: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return wallets;
    }),

    create: protectedProcedure
        .input(
            z.object({
                alias: z.string(),
                isDefault: z.boolean().default(false),
                network: z.string(),
                address: z.string(),
                keyId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // First create the wallet with a single balance
            const walletService = new WalletService({
                db: ctx.db,
                session: ctx.session
            });
            return walletService.createWallet(input);
        }),
    getAccount: protectedProcedure.input(z.object({
        walletId: z.string(),
    }))
        .query(async ({ ctx, input }) => {
            const walletService = new WalletService({
                db: ctx.db,
                session: ctx.session
            });
            return walletService.getAccount(input.walletId);
        }),
}); 