import { PrismaClient } from '../src/generated/prisma';
import { FORENSIC_ANALYSIS_TEMPLATE } from '../lib/forensic-analysis-template';

const prisma = new PrismaClient();

async function createForensicTemplate(userEmail: string) {
  try {
    console.log('🔍 Creating Deep Forensic Analysis template...');

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      return;
    }

    // Check if template already exists for this user
    const existingTemplate = await prisma.userTemplate.findFirst({
      where: {
        userId: user.id,
        name: FORENSIC_ANALYSIS_TEMPLATE.name
      }
    });

    if (existingTemplate) {
      console.log(`⚠️  Template "${FORENSIC_ANALYSIS_TEMPLATE.name}" already exists for user ${userEmail}`);
      return;
    }

    // Create the template
    const template = await prisma.userTemplate.create({
      data: {
        userId: user.id,
        name: FORENSIC_ANALYSIS_TEMPLATE.name,
        description: FORENSIC_ANALYSIS_TEMPLATE.description,
        category: FORENSIC_ANALYSIS_TEMPLATE.category,
        icon: FORENSIC_ANALYSIS_TEMPLATE.icon,
        systemPrompt: FORENSIC_ANALYSIS_TEMPLATE.systemPrompt,
        analysisPrompt: FORENSIC_ANALYSIS_TEMPLATE.analysisPrompt
      }
    });

    console.log('✅ Deep Forensic Analysis template created successfully!');
    console.log(`📊 Template Details:`);
    console.log(`   ID: ${template.id}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Category: ${template.category}`);
    console.log(`   Icon: ${template.icon}`);
    console.log(`   User: ${userEmail}`);

  } catch (error) {
    console.error('❌ Error creating forensic template:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script execution
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Please provide a user email as an argument');
  console.log('Usage: npx tsx scripts/create-forensic-template.ts user@example.com');
  process.exit(1);
}

createForensicTemplate(userEmail); 