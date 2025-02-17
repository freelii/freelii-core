import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { activityRouter } from "./routers/activity";
import { clientsRouter } from "./routers/clients";
import { invoicingRouter } from "./routers/invoicing";
import { ledgerRouter } from "./routers/ledger";
import { orchestratorRouter } from "./routers/orchestrator";
import { walletRouter } from "./routers/wallet";
import { webhookRouter } from "./routers/webhook";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  invoicing: invoicingRouter,
  wallet: walletRouter,
  ledger: ledgerRouter,
  webhook: webhookRouter,
  clients: clientsRouter,
  activity: activityRouter,
  orchestrator: orchestratorRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
