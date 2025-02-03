import { getSacBalance } from "@/lib/get-sac";
import { MAINNET, TESTNET } from "@freelii/utils/constants";
import { Asset, rpc } from "@stellar/stellar-sdk/minimal";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const walletRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const wallets = await ctx.db.wallet.findMany({
            where: {
                userId: ctx.session.user.id,
            },
            include: {
                balances: true,
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
            const balances = [];

            if (input.network === "mainnet") {
                balances.push({
                    address: MAINNET.USDC,
                    currency: "USDC",
                    amount: 0,
                });
            } else if (input.network === "testnet") {
                balances.push({
                    address: TESTNET.USDC,
                    currency: "USDC",
                    amount: 0,
                });
            }

            const wallet = await ctx.db.wallet.create({
                data: {
                    alias: input.alias,
                    isDefault: input.isDefault,
                    userId: ctx.session.user.id,
                    keyId: input.keyId,
                    address: input.address,
                    network: input.network,
                    balances: {
                        create: balances,
                    },
                },
                include: {
                    balances: true,
                },
            });

            return wallet;
        }),
    getAccount: protectedProcedure.input(z.object({
        walletId: z.string(),
    })).query(async ({ ctx, input }) => {
        const wallet = await ctx.db.wallet.findFirst({
            where: {
                userId: ctx.session.user.id,
                id: input.walletId,
            },
            include: {
                balances: true,
            },
        });


        // Get contract Balance
        console.log('input to getContractBalance:', input.contractAddress);
        const sorobanServer = new rpc.Server("https://soroban-testnet.stellar.org");
        const passphrase = "Test SDF Network ; September 2015";
        const indexedSAC = wallet?.balances.map(b => getSacBalance(b.address)) as Asset[];
        indexedSAC.push(Asset.native());

        if (wallet?.address) {
            const balancePromises = indexedSAC.map(async sac => {
                const balance = await sorobanServer.getSACBalance(wallet?.address, sac, passphrase);
                const key = `${sac.code}-${sac.issuer ?? ''}`;
                if (key === 'XLM-') {
                    return {
                        key: 'XLM',
                        balance: balance?.balanceEntry?.amount || "0"
                    };
                }
                return {
                    key: `${sac.code}-${sac.issuer}`,
                    balance: balance?.balanceEntry?.amount || "0"
                };
            });

            const stellarBalances = await Promise.all(balancePromises);
            console.log('stellarBalances', stellarBalances);
            wallet?.balances?.push({
                address: 'XLM',
                currency: 'XLM',
                amount: 0,
            });
            wallet?.balances?.forEach(walletBalance => {
                walletBalance.amount = stellarBalances.find(stellarBalance => stellarBalance.key === walletBalance.address)?.balance;
            });
        }

        console.log('wallet', wallet);
        return wallet;
    }),
}); 