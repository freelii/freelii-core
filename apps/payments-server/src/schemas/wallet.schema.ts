import { z } from 'zod';

export const createWalletSchema = z.object({
    alias: z.string().min(1, 'Alias is required'),
    externalId: z.string().optional(),
});

export const createWalletRequestSchema = z.object({
    body: createWalletSchema,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

