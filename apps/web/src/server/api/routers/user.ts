import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { LinkWithdrawalAccountSchema } from "@/server/services/user/schemas/link-withdrawal-account.schema";
import { UserService } from "@/server/services/user/user-service";
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
        .input(z.object({ contact: z.string(), name: z.string(), useCase: z.string() }))
        .mutation(async ({ ctx, input }) => {
            let isEmail = false;
            if (input.contact.includes("@")) {
                isEmail = true;
            }
            const user = await ctx.db.waitlist.create({
                data: {
                    contact: input.contact,
                    name: input.name,
                    use_case: input.useCase,
                    is_email: isEmail,
                },
            });
            return user;
        }),
    linkWithdrawalAccount: protectedProcedure
        .input(LinkWithdrawalAccountSchema)
        .mutation(async ({ ctx, input }) => {
            const userService = new UserService({
                db: ctx.db,
                session: ctx.session,
            });
            return userService.linkWithdrawalAccount(input);
        }),
    listWithdrawalAccounts: protectedProcedure
        .query(async ({ ctx }) => {
            const userService = new UserService({
                db: ctx.db,
                session: ctx.session,
            });
            return userService.listWithdrawalAccounts();
        }),
});
