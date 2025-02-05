import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
export const clientsRouter = createTRPCRouter({
    search: protectedProcedure
        .input(z.object({
            query: z.string().optional(),
            page: z.number().optional(),
            limit: z.number().optional(),
        })).query(async ({ ctx, input }) => {
            const { query, page = 1, limit = 10 } = input;
            const skip = (page - 1) * limit;
            const where: Prisma.ClientWhereInput = {
                user_id: Number(ctx.session.user.id),
            };
            if (query) {
                where.name = {
                    contains: query,
                    mode: "insensitive",
                };
            }
            return await ctx.db.client.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: "desc",
                }, include: {
                    address: true,
                    fiat_accounts: true,
                    blockchain_accounts: true,
                }
            });
        }),
});

