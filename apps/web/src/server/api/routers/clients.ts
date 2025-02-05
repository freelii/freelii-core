import { ClientService } from "@/server/services/client/client-service";
import { ClientCreateSchema } from "@/server/services/client/schemas/client-create.schema";
import { ClientSearchSchema } from "@/server/services/client/schemas/client-search.schema";
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

            const clientService = new ClientService({ db: ctx.db, session: ctx.session });
            return clientService.createClient(input);
        }),
});

