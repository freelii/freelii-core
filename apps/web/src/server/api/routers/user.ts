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
});
