
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@charisma-ai.com' }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with this email');
      process.exit(0);
    }

    // Use the specified admin password
    const plainPassword = 'moha12@meme';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@charisma-ai.com',
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
