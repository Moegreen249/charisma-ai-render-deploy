import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function testSignup() {
  try {
    console.log('Testing signup process...');
    
    // Test database connection
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Current user count: ${userCount}`);
    
    // Test password hashing
    console.log('2. Testing password hashing...');
    const testPassword = 'testpassword123';
    const hashedPassword = await hashPassword(testPassword);
    console.log('✅ Password hashing works');
    
    // Test user creation
    console.log('3. Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    
    console.log('✅ User created successfully:', user);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 All signup tests passed!');
    
  } catch (error) {
    console.error('❌ Signup test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSignup();