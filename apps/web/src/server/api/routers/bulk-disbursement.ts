import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { BulkDisbursementService } from "@/server/services/bulk-disbursement/bulk-disbursement-service";
import { z } from "zod";

const CreateBulkDisbursementSchema = z.object({
    recipients: z.array(z.object({
        recipientId: z.number().min(1),
        amountUsd: z.number().min(0.01) // Minimum $0.01
    })).min(1).max(100), // Max 100 recipients per bulk disbursement
    reference: z.string().optional()
});

const GetBulkDisbursementSchema = z.object({
    id: z.string().min(1)
});

const GetBulkDisbursementsSchema = z.object({
    limit: z.number().min(1).max(100).optional().default(10),
    offset: z.number().min(0).optional().default(0)
});

export const bulkDisbursementRouter = createTRPCRouter({
    /**
     * Create a new bulk disbursement
     */
    create: protectedProcedure
        .input(CreateBulkDisbursementSchema)
        .mutation(async ({ input, ctx }) => {
            const service = new BulkDisbursementService({ db: ctx.db, session: ctx.session });
            return service.createBulkDisbursement(input);
        }),

    /**
     * Process a bulk disbursement (initiate all payments)
     */
    process: protectedProcedure
        .input(GetBulkDisbursementSchema)
        .mutation(async ({ input, ctx }) => {
            const service = new BulkDisbursementService({ db: ctx.db, session: ctx.session });
            await service.processBulkDisbursement(input.id);
            return { success: true };
        }),

    /**
     * Get all bulk disbursements for the current user
     */
    getAll: protectedProcedure
        .input(GetBulkDisbursementsSchema)
        .query(async ({ input, ctx }) => {
            const service = new BulkDisbursementService({ db: ctx.db, session: ctx.session });
            return service.getBulkDisbursements(input.limit, input.offset);
        }),

    /**
     * Get a specific bulk disbursement
     */
    getById: protectedProcedure
        .input(GetBulkDisbursementSchema)
        .query(async ({ input, ctx }) => {
            const service = new BulkDisbursementService({ db: ctx.db, session: ctx.session });
            return service.getBulkDisbursement(input.id);
        }),

    /**
     * Get bulk disbursement statistics
     */
    getStats: protectedProcedure
        .query(async ({ ctx }) => {
            const senderId = parseInt(ctx.session.user.id);

            const stats = await ctx.db.bulkDisbursement.aggregate({
                where: { sender_id: senderId },
                _count: { id: true },
                _sum: { total_amount_usd: true }
            });

            const statusCounts = await ctx.db.bulkDisbursement.groupBy({
                by: ['status'],
                where: { sender_id: senderId },
                _count: { id: true }
            });

            return {
                totalDisbursements: stats._count.id || 0,
                totalAmountUsd: stats._sum.total_amount_usd || 0,
                statusCounts: statusCounts.reduce((acc, item) => {
                    acc[item.status] = item._count.id;
                    return acc;
                }, {} as Record<string, number>)
            };
        })
}); 