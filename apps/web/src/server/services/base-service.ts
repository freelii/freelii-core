import { PrismaClient } from "@prisma/client";

export class BaseService {
    protected db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }
}