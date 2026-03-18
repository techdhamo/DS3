import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a singleton Prisma client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export { getPrismaClient };
