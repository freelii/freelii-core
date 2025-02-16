import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export type Connection = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface BaseServiceOptions {
    db: Connection;
    session?: {
        user: {
            id: string;
        };
    };
}

export class BaseService {
    protected db: Connection;
    protected session: {
        user: {
            id: string;
        };
    };

    constructor(options: BaseServiceOptions) {
        this.db = options.db;
        if (!options.session) {
            throw new Error("Session is required");
        }
        this.session = options.session;
    }
}