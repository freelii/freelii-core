import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { coinsPHRouter } from "./routers/coinsph";
import { invoicingRouter } from "./routers/invoicing";
import { walletRouter } from "./routers/wallet";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  coinsph: coinsPHRouter,
  invoicing: invoicingRouter,
  wallet: walletRouter,
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
