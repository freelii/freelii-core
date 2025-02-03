import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
    addToWaitlist: publicProcedure
        .input(z.object({ contact: z.string(), name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            let isEmail = false;
            if (input.contact.includes("@")) {
                isEmail = true;
            }
            const user = await ctx.db.waitlist.create({
                data: {
                    contact: input.contact,
                    name: input.name,
                    isEmail,
                },
            });
            return user;
        }),
    listClients: publicProcedure
        .input(z.object({
            userId: z.number(),
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.client.findMany({ where: { userId: input.userId }, include: { address: true } });
        }),
    addClient: publicProcedure
        .input(z.object({
            userId: z.number(),
            client: z.object({
                name: z.string(),
                email: z.string(),
                address: z.object({
                    street: z.string(),
                    city: z.string(),
                    state: z.string().optional(),
                    country: z.string(),
                    zipCode: z.string().optional(),
                }),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.client.create({ data: { userId: input.userId, name: input.client.name, email: input.client.email, address: { create: input.client.address } } });
        }),
});
