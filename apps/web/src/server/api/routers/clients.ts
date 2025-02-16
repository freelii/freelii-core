import { ClientService } from "@/server/services/client/client-service";
import {
    ClientCreateSchema,
    ClientGetSchema,
    ClientSearchSchema
} from "@/server/services/client/schemas";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const clientsRouter = createTRPCRouter({
    search: protectedProcedure
        .input(ClientSearchSchema)
        .query(async ({ ctx, input }) => {
            const clientService = new ClientService({ db: ctx.db, session: ctx.session });
            return clientService.searchClients(input);
        }),
    create: protectedProcedure
        .input(ClientCreateSchema)
        .mutation(async ({ ctx, input }) => {
            return ctx.db.$transaction(async (tx) => {
                const clientService = new ClientService({ db: tx, session: ctx.session });
                return clientService.createClient(input);
            });
        }),
    get: protectedProcedure
        .input(ClientGetSchema)
        .query(async ({ ctx, input }) => {
            const clientService = new ClientService({ db: ctx.db, session: ctx.session });
            return clientService.getClient(input);
        }),
    archive: protectedProcedure
        .input(ClientGetSchema)
        .mutation(async ({ ctx, input }) => {
            const clientService = new ClientService({ db: ctx.db, session: ctx.session });
            return clientService.archiveClient(input);
        }),
    archiveMany: protectedProcedure
        .input(z.array(z.number()))
        .mutation(async ({ ctx, input }) => {
            const clientService = new ClientService({ db: ctx.db, session: ctx.session });
            return clientService.archiveMany(input);
        }),
});

