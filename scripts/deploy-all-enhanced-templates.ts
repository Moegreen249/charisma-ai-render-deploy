import { PrismaClient } from '../src/generated/prisma';
import { 
  ENHANCED_COMMUNICATION_TEMPLATE,
  ENHANCED_RELATIONSHIP_TEMPLATE,
  ENHANCED_BUSINESS_TEMPLATE,
  ENHANCED_COACHING_TEMPLATE,
  CLINICAL_THERAPEUTIC_TEMPLATE
} from '../lib/enhanced-templates';

const prisma = new PrismaClient();

const allEnhancedTemplates = [
  ENHANCED_COMMUNICATION_TEMPLATE,
  ENHANCED_RELATIONSHIP_TEMPLATE,
  ENHANCED_BUSINESS_TEMPLATE,
  ENHANCED_COACHING_TEMPLATE,
  CLINICAL_THERAPEUTIC_TEMPLATE
];

async function deployAllEnhancedTemplates(userEmail: string) {
  try {
    console.log('🚀 Deploying all enhanced analysis templates...');

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const templateData of allEnhancedTemplates) {
      // Check if template already exists for this user
      const existingTemplate = await prisma.userTemplate.findFirst({
        where: {
          userId: user.id,
          name: templateData.name
        }
      });

      if (existingTemplate) {
        console.log(`⚠️  Template "${templateData.name}" already exists for user ${userEmail}. Skipping.`);
        skippedCount++;
        continue;
      }

      // Create the template
      const template = await prisma.userTemplate.create({
        data: {
          userId: user.id,
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          icon: templateData.icon,
          systemPrompt: templateData.systemPrompt,
          analysisPrompt: templateData.analysisPrompt
        }
      });

      console.log(`✅ Created template: ${template.name} (${template.category})`);
      createdCount++;
    }

    console.log('🎉 Enhanced templates deployment completed!');
    console.log(`📊 Summary:`);
    console.log(`   User: ${userEmail}`);
    console.log(`   Created: ${createdCount} templates`);
    console.log(`   Skipped: ${skippedCount} templates (already exist)`);
    console.log(`   Total: ${allEnhancedTemplates.length} templates processed`);

    if (createdCount > 0) {
      console.log(`\n📚 Created Enhanced Templates:`);
      allEnhancedTemplates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.category}) ${template.icon}`);
      });

      console.log(`\n🔍 Template Categories:`);
      console.log(`   💬 Advanced Communication Analysis (general)`);
      console.log(`   💕 Deep Relationship Dynamics Analysis (personal)`);
      console.log(`   💼 Executive Leadership & Team Dynamics Analysis (business)`);
      console.log(`   🎯 Advanced Coaching & Development Analysis (coaching)`);
      console.log(`   🏥 Clinical & Therapeutic Assessment (clinical)`);
    }

  } catch (error) {
    console.error('❌ Error deploying enhanced templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script execution
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Please provide a user email as an argument');
  console.log('Usage: npx tsx scripts/deploy-all-enhanced-templates.ts user@example.com');
  console.log('');
  console.log('This will create all enhanced analysis templates:');
  console.log('  1. Advanced Communication Analysis');
  console.log('  2. Deep Relationship Dynamics Analysis');
  console.log('  3. Executive Leadership & Team Dynamics Analysis');
  console.log('  4. Advanced Coaching & Development Analysis');
  console.log('  5. Clinical & Therapeutic Assessment');
  process.exit(1);
}

deployAllEnhancedTemplates(userEmail); 