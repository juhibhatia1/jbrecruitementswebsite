"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var prisma_client_1 = require("./prisma-client");
var globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new prisma_client_1.PrismaClient({
        log: ["warn", "error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
