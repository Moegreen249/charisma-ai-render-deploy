#!/usr/bin/env tsx

import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface TestUser {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN';
}

const testUsers: TestUser[] = [
  {
    email: 'alice@test.com',
    password: 'test123',
    name: 'Alice Johnson',
    role: 'USER'
  },
  {
    email: 'bob@test.com',
    password: 'test123',
    name: 'Bob Smith',
    role: 'USER'
  },
  {
    email: 'carol@test.com',
    password: 'test123',
    name: 'Carol Davis',
    role: 'USER'
  },
  {
    email: 'david@test.com',
    password: 'test123',
    name: 'David Wilson',
    role: 'USER'
  },
  {
    email: 'emma@test.com',
    password: 'test123',
    name: 'Emma Brown',
    role: 'USER'
  }
];

async function createTestUser(userData: TestUser) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`⚠️  User ${userData.email} already exists - skipping`);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role || 'USER',
        emailVerified: new Date() // Mark as verified for testing
      }
    });

    console.log(`✅ Created user: ${user.email} (${user.name})`);
    return user;

  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Creating test users for CharismaAI...\n');

  try {
    // Create all test users
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await createTestUser(userData);
      createdUsers.push(user);
    }

    console.log('\n📋 Summary:');
    console.log(`✅ ${createdUsers.length} test users processed`);
    console.log('\n👥 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    testUsers.forEach(user => {
      console.log(`📧 ${user.email.padEnd(20)} | 🔑 ${user.password.padEnd(10)} | 👤 ${user.name}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 Next Steps:');
    console.log('1. Start the development server: pnpm dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Sign in with any of the test accounts above');
    console.log('4. Admin access: admin@charisma-ai.com / admin123');
    console.log('5. Admin dashboard: http://localhost:3000/admin');
    console.log('6. Launch controls: http://localhost:3000/admin/launch');

  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
