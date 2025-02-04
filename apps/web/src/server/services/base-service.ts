import { PrismaClient } from "@prisma/client";

export interface BaseServiceOptions {
    db: PrismaClient;
    session?: {
        user: {
            id: string;
        };
    };
}

export class BaseService {
    protected db: PrismaClient;
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