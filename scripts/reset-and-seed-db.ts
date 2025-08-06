import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function resetAndSeedDatabase() {
  console.log('🚀 Starting database reset and seeding process...\n');

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

    // Step 4: Create admin user
    console.log('📋 Step 4: Creating admin user...');
    const hashedPassword = await bcrypt.hash('Moha123@', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'Mo@charisma.ai',
        name: 'Mo',
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true,
        approvedAt: new Date(),
      },
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Step 5: Create system settings
    console.log('📋 Step 5: Creating system settings...');
    const systemSettings = await prisma.systemSettings.create({
      data: {
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotificationsEnabled: true,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['txt', 'doc', 'docx', 'pdf'],
        maxAnalysesPerUser: 100,
        retentionDays: 365,
        version: '1.0.0',
        lastUpdated: new Date(),
      },
    });
    console.log('✅ System settings created');

    // Step 6: Create SEO settings
    console.log('📋 Step 6: Creating SEO settings...');
    const seoSettings = await prisma.seoSettings.create({
      data: {
        title: 'Charisma AI - Advanced Communication Analysis',
        description: 'Transform your communication with AI-powered analysis and insights',
        keywords: 'AI, communication, analysis, charisma, personality, insights',
        ogImage: '/og-image.jpg',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://charisma.ai',
        robots: 'index, follow',
        lastUpdated: new Date(),
      },
    });
    console.log('✅ SEO settings created');

    // Step 7: Create launch countdown
    console.log('📋 Step 7: Creating launch countdown...');
    const launchCountdown = await prisma.launchCountdown.create({
      data: {
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        title: 'Charisma AI Launch',
        subtitle: 'Get ready for the future of communication analysis',
        isActive: true,
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
        completedTitle: 'Charisma AI is Live!',
        completedSubtitle: 'Start analyzing your communication today',
      },
    });
    console.log('✅ Launch countdown created');

    // Step 8: Create email templates
    console.log('📋 Step 8: Creating email templates...');
    const emailTemplates = await prisma.emailTemplate.createMany({
      data: [
        {
          name: 'Welcome Email',
          subject: 'Welcome to Charisma AI!',
          content: `
            <h1>Welcome to Charisma AI!</h1>
            <p>Thank you for joining us. Start analyzing your communication patterns today.</p>
            <p>Best regards,<br>The Charisma AI Team</p>
          `,
          type: 'WELCOME',
          isActive: true,
        },
        {
          name: 'Password Reset',
          subject: 'Reset Your Password',
          content: `
            <h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <a href="{{resetLink}}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
          `,
          type: 'PASSWORD_RESET',
          isActive: true,
        },
        {
          name: 'Invitation',
          subject: 'You\'re Invited to Join Charisma AI',
          content: `
            <h1>You're Invited!</h1>
            <p>You've been invited to join Charisma AI. Use this code: {{inviteCode}}</p>
            <p>Click here to sign up: {{signupLink}}</p>
          `,
          type: 'INVITATION',
          isActive: true,
        },
      ],
    });
    console.log('✅ Email templates created');

    // Step 9: Create blog categories
    console.log('📋 Step 9: Creating blog categories...');
    const categories = await prisma.blogCategory.createMany({
      data: [
        { name: 'Communication Tips', slug: 'communication-tips', description: 'Tips for better communication' },
        { name: 'AI Insights', slug: 'ai-insights', description: 'Latest insights in AI technology' },
        { name: 'Product Updates', slug: 'product-updates', description: 'Latest product features and updates' },
        { name: 'Case Studies', slug: 'case-studies', description: 'Real-world communication analysis examples' },
      ],
    });
    console.log('✅ Blog categories created');

    // Step 10: Create sample blog posts
    console.log('📋 Step 10: Creating sample blog posts...');
    const samplePosts = await prisma.blogPost.createMany({
      data: [
        {
          title: 'Welcome to Charisma AI',
          slug: 'welcome-to-charisma-ai',
          excerpt: 'Discover how AI can transform your communication patterns',
          content: `
            <h1>Welcome to Charisma AI</h1>
            <p>We're excited to introduce you to the future of communication analysis.</p>
            <p>Charisma AI uses advanced artificial intelligence to analyze your communication patterns and provide actionable insights.</p>
          `,
          authorId: adminUser.id,
          categoryId: (await prisma.blogCategory.findFirst({ where: { slug: 'ai-insights' } }))?.id,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          metaTitle: 'Welcome to Charisma AI - Communication Analysis Platform',
          metaDescription: 'Discover how AI can transform your communication patterns with Charisma AI',
        },
        {
          title: '5 Communication Tips for Better Relationships',
          slug: '5-communication-tips',
          excerpt: 'Learn essential communication strategies for building stronger relationships',
          content: `
            <h1>5 Communication Tips for Better Relationships</h1>
            <p>Effective communication is the foundation of any successful relationship.</p>
            <ol>
              <li>Listen actively</li>
              <li>Use "I" statements</li>
              <li>Practice empathy</li>
              <li>Be clear and concise</li>
              <li>Follow up on important conversations</li>
            </ol>
          `,
          authorId: adminUser.id,
          categoryId: (await prisma.blogCategory.findFirst({ where: { slug: 'communication-tips' } }))?.id,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          metaTitle: '5 Communication Tips for Better Relationships',
          metaDescription: 'Learn essential communication strategies for building stronger relationships',
        },
      ],
    });
    console.log('✅ Sample blog posts created');

    // Step 11: Create user profile for admin
    console.log('📋 Step 11: Creating admin user profile...');
    const adminProfile = await prisma.userProfile.create({
      data: {
        userId: adminUser.id,
        bio: 'Founder and CEO of Charisma AI',
        company: 'Charisma AI',
        position: 'CEO',
        location: 'San Francisco, CA',
        website: 'https://charisma.ai',
        twitter: '@charismaai',
        linkedin: 'linkedin.com/in/charismaai',
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
          },
          privacy: {
            profileVisibility: 'public',
            analysisVisibility: 'private',
          },
        },
      },
    });
    console.log('✅ Admin profile created');

    // Step 12: Create user welcome status
    console.log('📋 Step 12: Creating user welcome status...');
    const welcomeStatus = await prisma.userWelcome.create({
      data: {
        userId: adminUser.id,
        hasSeenWelcome: true,
        hasCompletedOnboarding: true,
        onboardingStep: 'completed',
        lastSeenAt: new Date(),
      },
    });
    console.log('✅ Welcome status created');

    console.log('\n🎉 Database reset and seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin user: ${adminUser.email}`);
    console.log(`- System settings: Created`);
    console.log(`- SEO settings: Created`);
    console.log(`- Launch countdown: Created`);
    console.log(`- Email templates: ${emailTemplates.count} created`);
    console.log(`- Blog categories: ${categories.count} created`);
    console.log(`- Sample blog posts: ${samplePosts.count} created`);
    console.log(`- User profile: Created for admin`);
    console.log(`- Welcome status: Created for admin`);

  } catch (error) {
    console.error('❌ Error during database reset and seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetAndSeedDatabase()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }); 