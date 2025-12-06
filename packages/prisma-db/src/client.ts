import { PrismaClient } from "../generated/client";
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

// Export Prisma types
export type { Link } from "../generated/client";