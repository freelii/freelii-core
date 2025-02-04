import { getSacBalance } from "@/lib/get-sac";
import { MAINNET, TESTNET } from "@freelii/utils/constants";
import { Asset, rpc } from "@stellar/stellar-sdk/minimal";
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
        console.log("wallets", wallets);
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
            const wallet = await ctx.db.wallet.create({
                data: {
                    alias: input.alias,
                    isDefault: input.isDefault,
                    userId: Number(ctx.session.user.id),
                    keyId: input.keyId,
                    address: input.address,
                    network: input.network,
                    balances: {
                        create: [
                            {
                                address: 'XLM',
                                currency: 'XLM',
                                amount: 0,
                            },
                            {
                                address: input.network === "mainnet" ? MAINNET.USDC : TESTNET.USDC,
                                currency: "USDC",
                                amount: 0,
                            }
                        ],
                    },
                },
                include: {
                    balances: true,
                },
            });

            // Then update the wallet to set the USDC balance as the main balance
            const usdcBalance = wallet.balances.find(b => b.currency === "USDC");
            if (!usdcBalance) {
                throw new Error('USDC balance not created');
            }

            const updatedWallet = await ctx.db.wallet.update({
                where: { id: wallet.id },
                data: {
                    mainBalanceId: usdcBalance.id,
                },
                include: {
                    balances: true,
                    mainBalance: true,
                },
            });

            return updatedWallet;
        }),
    getAccount: protectedProcedure.input(z.object({
        walletId: z.string(),
    }))
        .query(async ({ ctx, input }) => {
            const wallet = await ctx.db.wallet.findFirstOrThrow({
                where: {
                    userId: Number(ctx.session.user.id),
                    id: input.walletId,
                },
                include: {
                    balances: true,
                    mainBalance: true,
                },
            });


            // Get contract Balance
            const sorobanServer = new rpc.Server("https://soroban-testnet.stellar.org");
            const passphrase = "Test SDF Network ; September 2015";
            const indexedSAC = wallet.balances?.map(b => getSacBalance(b.address)) ?? [];
            indexedSAC.push(Asset.native());

            const { address } = wallet ?? {};
            if (wallet && address) {
                const balancePromises = indexedSAC.map(async sac => {
                    const balance = await sorobanServer.getSACBalance(address, sac, passphrase);
                    const key = `${sac.code}-${sac.issuer ?? ''}`;
                    if (key === 'XLM-') {
                        return {
                            key: 'XLM',
                            balance: balance?.balanceEntry?.amount ?? "0"
                        };
                    }
                    return {
                        key: `${sac.code}-${sac.issuer}`,
                        balance: balance?.balanceEntry?.amount ?? "0"
                    };
                });

                const stellarBalances = await Promise.all(balancePromises);
                console.log('stellarBalances', stellarBalances);
                if (wallet?.balances) {
                    wallet?.balances?.push({
                        address: 'XLM',
                        currency: 'XLM',
                        amount: 0,
                        walletId: wallet.id,
                        id: '-',
                        createdAt: wallet.createdAt,
                        updatedAt: new Date()
                    });
                } else {
                    wallet.balances = [{
                        address: 'XLM',
                        currency: 'XLM',
                        amount: 0,
                        walletId: wallet.id,
                        id: '-',
                        createdAt: wallet.createdAt,
                        updatedAt: new Date()
                    }];
                }
                wallet?.balances?.forEach(walletBalance => {
                    walletBalance.amount = Number(stellarBalances.find(stellarBalance => stellarBalance.key === walletBalance.address)?.balance ?? 0);
                });
            }

            console.log('wallet', wallet);
            return wallet;
        }),
}); 