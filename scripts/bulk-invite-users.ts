import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { generateTempPassword } from '../lib/utils';
import { sendWelcomeEmail } from '../lib/email';

const prisma = new PrismaClient();

interface UserInvite {
  name: string;
  role?: 'USER' | 'ADMIN';
}

async function createUser(name: string, role: 'USER' | 'ADMIN' = 'USER') {
  const emailName = name.toLowerCase().replace(/\s+/g, '.');
  const email = `${emailName}@charisma.ai`;
  const tempPassword = generateTempPassword();
  const hashedPassword = await hash(tempPassword, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: new Date(),
        requirePasswordChange: true,
      },
    });

    // Generate personalized welcome message
    const welcomeMessage = `
Dear ${name},

Welcome to Charisma AI! We're thrilled to have you join our community.

Your account has been created with the following credentials:
Email: ${email}
Temporary Password: ${tempPassword}

For security reasons, you will be prompted to change your password upon your first login.

Thank you for your support and trust in Charisma AI. We're excited to have you on board!

Best regards,
The Charisma AI Team
    `;

    // Send welcome email (implement this in notifications.ts)
    const welcomeResult = await sendWelcomeEmail(email, 'default', {
      name,
      email,
      tempPassword,
      loginUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    });

    return {
      success: true,
      user,
      tempPassword,
      welcomeMessage,
    };
  } catch (error) {
    console.error(`Failed to create user ${name}:`, error);
    return {
      success: false,
      error,
    };
  }
}

export async function bulkInviteUsers(users: UserInvite[]) {
  const results = [];

  for (const user of users) {
    const result = await createUser(user.name, user.role);
    results.push({
      name: user.name,
      ...result,
    });
  }

  return results;
}

// For CLI usage
if (require.main === module) {
  const users: UserInvite[] = [
    // Add your users here
    // { name: "John Smith", role: "USER" },
  ];

  bulkInviteUsers(users)
    .then((results) => {
      console.log('Invitation Results:');
      results.forEach((result) => {
        if (result.success) {
          console.log(`\nSuccessfully invited ${result.name}:`);
          console.log(`Email: ${result.user.email}`);
          console.log(`Temporary Password: ${result.tempPassword}`);
          console.log('\nWelcome Message:');
          console.log(result.welcomeMessage);
        } else {
          console.error(`\nFailed to invite ${result.name}:`, result.error);
        }
      });
    })
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
