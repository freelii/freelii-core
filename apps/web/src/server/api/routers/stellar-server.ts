import { env } from "@/env";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PasskeyServer } from "freelii-passkey-kit";
import pino from "pino";
import createWriteStream from 'pino-datadog-transport';
import { z } from "zod";

const logger = pino({
    level: 'info',
    name: 'freelii-stellar-passkey-server',
}, createWriteStream({
    ddClientConf: {
        authMethods: {
            apiKeyAuth: env.DATADOG_API_KEY
        }
    },
    ddServerConf: {
        site: "us5.datadoghq.com"
    }
}));


export const stellarServerRouter = createTRPCRouter({
    submit: protectedProcedure.input(
        z.object({
            xdr: z.string(),
            rpcUrl: z.string(),
            launchtubeUrl: z.string(),
            launchtubeJwt: z.string(),
            mercuryProjectName: z.string(),
            mercuryUrl: z.string(),
            mercuryJwt: z.string(),
        })).mutation(async ({ input }) => {
            const server = new PasskeyServer({
                rpcUrl: input.rpcUrl,
                launchtubeUrl: input.launchtubeUrl,
                launchtubeJwt: input.launchtubeJwt,
                mercuryProjectName: input.mercuryProjectName,
                mercuryUrl: input.mercuryUrl,
                mercuryJwt: input.mercuryJwt,
                logging: logger,
            });

            const result = await server.send(input.xdr).catch((error) => {
                console.error('error', error);
                throw error;
            });
            return result;
        }),
});