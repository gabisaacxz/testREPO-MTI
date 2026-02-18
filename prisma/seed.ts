import { PrismaClient, WorkCategory } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// 1. Manually load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  try {
    console.log('📡 Connecting to Database...');

    // --- 1. Seed Sites (For Field Work) ---
    const sites = [
      {
        siteIdCode: 'MTI-MANILA-01',
        siteName: 'Manila Tower Project',
        locationAddress: 'Ermita, Manila',
      },
      {
        siteIdCode: 'MTI-CEBU-05',
        siteName: 'Cebu Data Center',
        locationAddress: 'IT Park, Cebu City',
      },
      {
        siteIdCode: 'MTI-DAVAO-12',
        siteName: 'Davao Telecom Hub',
        locationAddress: 'Lanang, Davao City',
      }
    ];

    for (const site of sites) {
      await prisma.site.upsert({
        where: { siteIdCode: site.siteIdCode },
        update: {},
        create: {
          siteIdCode: site.siteIdCode,
          siteName: site.siteName,
          locationAddress: site.locationAddress,
          isActive: true,
        },
      });
    }

    // --- 2. Seed Users (Employees) ---
    const users = [
      {
        email: 'cto@martindaletech.com',
        firstName: 'Michael',
        lastName: 'Technical',
        category: WorkCategory.HEAD_OFFICE,
        department: 'Operations',
        position: 'Chief Technical Officer',
        role: 'ADMIN',
      },
      {
        email: 'bdm@martindaletech.com',
        firstName: 'Sarah',
        lastName: 'Sales',
        category: WorkCategory.HEAD_OFFICE,
        department: 'Sales and SAQ',
        position: 'Business Development Manager',
        role: 'USER',
      },
      {
        email: 'tl1@martindaletech.com',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        category: WorkCategory.FIELD,
        department: 'Telecom Enterprise',
        position: 'Team Leader',
        role: 'USER',
      }
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          passwordHash: '$2b$10$dummyhash', 
          status: 'ACTIVE',
        },
      });
    }

    console.log('✅ Seed successful! Database is now populated.');
  } catch (error) {
    console.error('❌ Database Operation Error:', error);
    process.exit(1);
  } finally {
    // Explicitly disconnect to let the process exit
    await prisma.$disconnect();
  }
}

main();