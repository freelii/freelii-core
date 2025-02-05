import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
    getUser: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
        if (!input.id) {
            throw new Error("User not found");
        }
        const user = await ctx.db.user.findUnique({
            where: { id: Number(input.id) }, include: {
                wallets: true,
            }
        });
        return user;
    }),
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
                    is_email: isEmail,
                },
            });
            return user;
        }),
});
