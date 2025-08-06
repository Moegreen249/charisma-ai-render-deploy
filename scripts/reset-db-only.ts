import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function resetDatabaseOnly() {
  console.log('🚀 Starting database reset process...\n');

  try {
    // Step 1: Reset database (drop all data)
    console.log('📋 Step 1: Resetting database...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    await prisma.$executeRaw`CREATE SCHEMA public`;
    await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO postgres`;
    await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO public`;
    console.log('✅ Database reset completed\n');

    // Step 2: Run Prisma migrations
    console.log('📋 Step 2: Running Prisma migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed\n');

    // Step 3: Generate Prisma client
    console.log('📋 Step 3: Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    console.log('\n🎉 Database reset completed successfully!');
    console.log('📝 Next steps:');
    console.log('1. Run seeding script: npm run seed');
    console.log('2. Or run the full reset and seed: npm run reset-and-seed');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetDatabaseOnly()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }); 