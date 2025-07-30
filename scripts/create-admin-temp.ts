
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'mo@charisma-ai.com' }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with this email');
      process.exit(0);
    }

    // Read password from environment variable
    const plainPassword = process.env.ADMIN_PASSWORD;
    if (!plainPassword || plainPassword.length < 8) {
      console.error('❌ Admin password missing or too short in environment variable');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Moe',
        email: 'mo@charisma-ai.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    });

    console.log('✅ Admin account created successfully');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);

  } catch (error) {
    console.error('❌ Failed to create admin account:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
