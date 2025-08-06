import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@charisma-ai.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash('moha12@meme', 10);
      
      // Update the existing user
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@charisma-ai.com' },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isApproved: true,
          approvedAt: new Date()
        }
      });
      
      console.log('✅ Admin user updated:', updatedUser.email);
      return updatedUser;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('moha12@meme', 10);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@charisma-ai.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true,
        approvedAt: new Date()
      }
    });

    console.log('✅ Admin user created:', adminUser.email);
    console.log('📧 Email: admin@charisma-ai.com');
    console.log('🔑 Password: moha12@meme');
    console.log('👑 Role: ADMIN');

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();