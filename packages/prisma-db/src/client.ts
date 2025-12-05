import { PrismaClient } from "../prisma/generated/client";
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;