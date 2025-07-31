import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('📊 Checking current database state...');
    
    const modules = await prisma.analysisModule.findMany({
      select: { name: true, category: true }
    });
    console.log(`\n🔧 Analysis Modules: ${modules.length}`);
    modules.forEach(m => console.log(`  - ${m.name} (${m.category})`));
    
    const templates = await prisma.userTemplate.findMany({
      select: { name: true, category: true, userId: true }
    });
    console.log(`\n📄 User Templates: ${templates.length}`);
    templates.forEach(t => console.log(`  - ${t.name} (${t.category}) [User: ${t.userId}]`));
    
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    });
    console.log(`\n👤 Users: ${users.length}`);
    users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();