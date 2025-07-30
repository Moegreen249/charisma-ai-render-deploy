import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createAdminUser() {
  const prisma = new PrismaClient();

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Moha123@', 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email: 'Mo@charisma.ai',
        name: 'Mo',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin user created successfully:');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      console.error('Error: User with this email already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser().catch(console.error);
