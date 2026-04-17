import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export { getPrismaClient };
