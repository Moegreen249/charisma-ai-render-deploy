const { PrismaClient } = require('../src/generated/prisma');
require('dotenv').config();

async function listUsers() {
  // Verify we have the database URL
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.log('Please make sure you have the correct Supabase connection string in your .env file');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const prisma = new PrismaClient();

  try {
    console.log('Fetching users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('\nNo users found in the database.');
    } else {
      console.log(`\nFound ${users.length} users in the database:`);
      console.log(JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error('\nError fetching users:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Make sure your DATABASE_URL is correct and you can connect to Supabase');
    } else {
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

listUsers().catch(console.error);
