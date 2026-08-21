"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dbUrl = process.env.DATABASE_URL;
const prisma = new client_1.PrismaClient(dbUrl
    ? { datasources: { db: { url: dbUrl } } }
    : undefined);
exports.prisma = prisma;
