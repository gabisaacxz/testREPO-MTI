// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 1. Initialize the pg pool with your connection string [cite: 24]
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// 2. Initialize the adapter [cite: 24]
const adapter = new PrismaPg(pool)

// 3. Export the client with the adapter attached 
export const prisma = 
  globalForPrisma.prisma ?? 
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma