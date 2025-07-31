import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function createTemplatesFromModules() {
  try {
    console.log('📋 Creating user templates from analysis modules...');

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@charisma-ai.com' }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found. Please create admin user first.');
      return;
    }

    // Get all analysis modules
    const modules = await prisma.analysisModule.findMany({
      where: { isActive: true }
    });

    console.log(`📊 Found ${modules.length} analysis modules to convert to templates`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const module of modules) {
      // Check if template already exists
      const existingTemplate = await prisma.userTemplate.findFirst({
        where: {
          userId: adminUser.id,
          name: module.name
        }
      });

      if (existingTemplate) {
        console.log(`⚠️  Template "${module.name}" already exists. Skipping.`);
        skippedCount++;
        continue;
      }

      // Create user template from module
      const template = await prisma.userTemplate.create({
        data: {
          userId: adminUser.id,
          name: module.name,
          description: module.description,
          category: module.category,
          icon: module.icon,
          systemPrompt: `You are an expert analyst specializing in ${module.category} analysis. Use the following analysis framework to provide detailed insights.`,
          analysisPrompt: module.instructionPrompt,
          expectedOutput: module.expectedJsonHint,
          isActive: true,
          isBuiltIn: module.isBuiltIn || false
        }
      });

      console.log(`✅ Created template: ${template.name} (${template.category})`);
      createdCount++;
    }

    console.log('\n🎉 Template creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   User: ${adminUser.email}`);
    console.log(`   Created: ${createdCount} templates`);
    console.log(`   Skipped: ${skippedCount} templates (already exist)`);
    console.log(`   Total modules processed: ${modules.length}`);

    if (createdCount > 0) {
      console.log(`\n📚 Created Templates by Category:`);
      
      const categories = [...new Set(modules.map(m => m.category))];
      for (const category of categories) {
        const categoryModules = modules.filter(m => m.category === category);
        console.log(`\n${category.toUpperCase()} (${categoryModules.length} templates):`);
        categoryModules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.name}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error creating templates from modules:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTemplatesFromModules();