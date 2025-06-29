import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { EmailService } from "@/server/services/email/email.service";
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

            // Create waitlist entry
            const user = await ctx.db.waitlist.create({
                data: {
                    contact: input.contact,
                    name: input.name,
                    use_case: input.useCase,
                    is_email: isEmail,
                },
            });

            // Send confirmation email if contact is an email
            if (isEmail) {
                try {
                    // Get waitlist position (count of all entries before this one)
                    const position = await ctx.db.waitlist.count({
                        where: {
                            created_at: {
                                lte: user.created_at
                            }
                        }
                    });

                    const emailService = new EmailService({
                        db: ctx.db,
                        session: undefined, // Public procedure doesn't have session
                    });

                    await emailService.sendWaitlistConfirmation({
                        name: input.name,
                        email: input.contact,
                        useCase: input.useCase,
                        position: position,
                    });

                    console.log(`✅ Waitlist confirmation email sent to ${input.contact}`);
                } catch (emailError) {
                    // Log error but don't fail the waitlist signup
                    console.error('❌ Failed to send waitlist confirmation email:', emailError);
                    // We don't throw here so the waitlist signup still succeeds
                }
            }

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
