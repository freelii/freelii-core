import { ActivityService } from "@/server/services/activity/activity-service";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const activityRouter = createTRPCRouter({
    getActivity: protectedProcedure
        .input(z.object({
            items: z.number().optional().default(5)
        }))
        .query(async ({ ctx, input }) => {
            return await new ActivityService(ctx).getActivity(input.items)
        })
})