import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const initialModules = [
  {
    name: "Emotional Arc Tracking",
    description: "Analyzes emotional intensity over conversation time.",
    instructionPrompt: `Extract the emotional arc of the conversation. For each significant point, identify the timestamp, primary emotion, and its intensity (0-1). Provide an overall emotional summary. Return an insight of type 'chart' with data for a line chart showing emotional intensity over time.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Emotional Arc",
      content: [
        {
          timestamp: "0:00",
          intensity: 0.5,
          emotion: "Neutral"
        }
      ],
      metadata: {
        chartTypeHint: "line",
        xDataKey: "timestamp",
        yDataKey: "intensity",
        colorSchemeHint: "intensity",
        mainColor: "#FF6B6B",
        unit: "Intensity Score",
        descriptionShort: "Tracks emotional intensity over time"
      }
    }, null, 2),
    category: "emotional",
    icon: "💭",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Key Topic Identification",
    description: "Identifies main discussion topics and their relevance.",
    instructionPrompt: `List the top 5 key topics discussed. For each topic, provide a name, a list of relevant keywords, and a relevance score (0-1). Return an insight of type 'chart' with data for a bar chart showing topic relevance.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Topic Relevance",
      content: [
        {
          name: "Project Update",
          relevance: 0.8
        }
      ],
      metadata: {
        chartTypeHint: "bar",
        xDataKey: "name",
        yDataKey: "relevance",
        colorSchemeHint: "categorical",
        mainColor: "#10B981",
        unit: "Relevance Score",
        descriptionShort: "Shows topic relevance and importance"
      }
    }, null, 2),
    category: "content",
    icon: "📊",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Communication Pattern Analysis",
    description: "Identifies recurring communication patterns and their impact.",
    instructionPrompt: `Analyze the conversation for recurring communication patterns. Identify patterns like questioning styles, response types, engagement levels, and their impact on the conversation flow. Return an insight of type 'list' with pattern descriptions.`,
    expectedJsonHint: JSON.stringify({
      type: "list",
      title: "Communication Patterns",
      content: [
        "Active listening with reflective responses",
        "Open-ended questions to encourage elaboration"
      ],
      metadata: {
        category: "pattern",
        priority: 3,
        icon: "users",
        color: "blue"
      }
    }, null, 2),
    category: "pattern",
    icon: "🔄",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Personality Trait Assessment",
    description: "Evaluates personality traits evident in communication style.",
    instructionPrompt: `Assess the personality traits evident in the communication style. Look for traits like openness, conscientiousness, extraversion, agreeableness, and neuroticism. Provide a summary and specific examples. Return an insight of type 'text' with personality analysis.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Personality Assessment",
      content: "The speaker demonstrates high openness and agreeableness, with moderate extraversion. They show thoughtful consideration of others' perspectives and willingness to explore new ideas.",
      metadata: {
        category: "personality",
        priority: 4,
        icon: "brain",
        color: "purple"
      }
    }, null, 2),
    category: "personality",
    icon: "🧠",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Engagement Level Measurement",
    description: "Measures conversation engagement and participation levels.",
    instructionPrompt: `Measure the engagement level throughout the conversation. Track participation frequency, response quality, and emotional investment. Provide an overall engagement score and identify high/low engagement moments. Return an insight of type 'metric' with engagement data.`,
    expectedJsonHint: JSON.stringify({
      type: "metric",
      title: "Engagement Level",
      content: 85,
      metadata: {
        category: "overall",
        priority: 3,
        icon: "activity",
        color: "green",
        unit: "%"
      }
    }, null, 2),
    category: "overall",
    icon: "📈",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Decision Making Analysis",
    description: "Analyzes decision-making processes and styles in conversation.",
    instructionPrompt: `Analyze the decision-making processes evident in the conversation. Identify decision styles (analytical, intuitive, collaborative), decision points, and factors influencing choices. Return an insight of type 'timeline' with decision events.`,
    expectedJsonHint: JSON.stringify({
      type: "timeline",
      title: "Decision Making Process",
      content: [
        {
          description: "Initial problem identification",
          context: "Clear definition of the challenge",
          timestamp: "0:30"
        }
      ],
      metadata: {
        category: "pattern",
        priority: 3,
        icon: "target",
        color: "orange"
      }
    }, null, 2),
    category: "pattern",
    icon: "🎯",
    isActive: true,
    isBuiltIn: true,
  }
];

async function seedModules() {
  try {
    console.log('🌱 Starting module seeding...');

    // Check if modules already exist
    const existingModules = await prisma.analysisModule.findMany();
    
    if (existingModules.length > 0) {
      console.log(`⚠️  Found ${existingModules.length} existing modules. Skipping seed.`);
      return;
    }

    // Create modules
    for (const moduleData of initialModules) {
      const module = await prisma.analysisModule.create({
        data: moduleData,
      });
      console.log(`✅ Created module: ${module.name}`);
    }

    console.log('🎉 Module seeding completed successfully!');
    console.log(`📊 Created ${initialModules.length} modules:`);
    initialModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.name} (${module.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding modules:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedModules()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }); 