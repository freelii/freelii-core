import { z } from "zod";

export const ClientGetSchema = z.object({
    id: z.number(),
});

