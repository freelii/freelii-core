import { z } from "zod";

export const ClientSearchSchema = z.object({
    query: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
});