"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Ensure environment variables are loaded (supporting standalone scripts/tests)
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:../prisma/dev.db'
        }
    }
});
exports.prisma = prisma;
