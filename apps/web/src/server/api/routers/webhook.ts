import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";


export const webhookRouter = createTRPCRouter({
    coinsph: publicProcedure.input(z.any()).mutation(({ ctx, input }) => {
        console.log('input', input);
        return { ok: true };
    }),
}); 