import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const forensicModules = [
  {
    name: "Participant Psychological Profiling",
    description: "Deep psychological analysis using Robert Greene's frameworks: masks, shadows, core desires/fears, seductive/toxic archetypes, attachment styles, and cognitive biases.",
    instructionPrompt: `Conduct a comprehensive psychological profile of each participant using Robert Greene's analytical frameworks.

ANALYZE:
1. THE MASK: Public-facing persona and impression management strategies
2. THE SHADOW: Repressed aspects revealed through contradictions and emotional leakage  
3. CORE DESIRE & FEAR: Primary motivations and deepest insecurities
4. SEDUCTIVE ARCHETYPE: Attraction style (Siren, Rake, Charmer, Coquette, etc.)
5. TOXIC ARCHETYPE: Dysfunction patterns under stress (Drama Magnet, Moralizer, Bumbler, etc.)
6. ANTI-SEDUCER TRAITS: Behaviors that disrupt connection and attraction
7. ATTACHMENT STYLE: Relational patterns (Secure, Anxious-Preoccupied, Dismissive-Avoidant, Fearful-Avoidant)
8. CONFLICT STYLE: Approach to disagreement (Confrontational, Passive-Aggressive, Avoidant, Collaborative)
9. COGNITIVE BIASES: Repeated mental errors (Confirmation Bias, Blame Bias, etc.)
10. PATHOLOGICAL INDICATORS: Observational notes on Dark Triad traits (grandiosity, lack of empathy, manipulation)

For each participant, provide specific evidence from the chat and detailed psychological insights.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Psychological Profile: [Participant Name]",
      content: "Comprehensive psychological analysis covering: THE MASK (public persona strategies), THE SHADOW (repressed desires revealed through contradiction), CORE DESIRE (deep motivation), CORE FEAR (primary insecurity), SEDUCTIVE ARCHETYPE (attraction style), TOXIC ARCHETYPE (stress dysfunction), ATTACHMENT STYLE (relational pattern), CONFLICT STYLE (disagreement approach), COGNITIVE BIASES (mental errors), and PATHOLOGICAL INDICATORS (observational traits). Evidence: [specific chat quotes and behavioral patterns]",
      metadata: {
        category: "psychology",
        priority: 5,
        confidence: 0.9,
        color: "purple",
        icon: "user"
      }
    }, null, 2),
    category: "psychology",
    icon: "🧠",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Relationship Dynamics & Power Analysis",
    description: "Analyzes systemic relationship dynamics, power structures, seduction flows, frame control, and connection patterns between participants.",
    instructionPrompt: `Analyze the systemic relationship dynamics and power structures in the conversation.

ANALYZE:
1. THE UNSPOKEN CONTRACT: Implicit rules and agreements governing the interaction
2. SEDUCTION FLOW MAP: Tactical influence patterns (mixed signals, triangulation, hot/cold dynamics)
3. POWER & FRAME CONTROL: Who controls the narrative and emotional frame, how control shifts
4. BIDS FOR CONNECTION: Attempts at intimacy, how they're received (turning toward/away/against)
5. DOMINANCE PATTERNS: Who initiates, who responds, who sets topics
6. EMOTIONAL LABOR: Who provides support, who receives it
7. BOUNDARY DYNAMICS: How limits are set, respected, or violated
8. INFLUENCE TACTICS: Persuasion, manipulation, or authentic connection attempts

Identify specific patterns with supporting evidence from the chat.`,
    expectedJsonHint: JSON.stringify({
      type: "text", 
      title: "Relationship Dynamics Analysis",
      content: "THE UNSPOKEN CONTRACT: [implicit rules governing interaction]. POWER & FRAME CONTROL: [who dominates narrative, how control shifts]. SEDUCTION FLOW MAP: [tactical influence patterns with examples]. BIDS FOR CONNECTION: [intimacy attempts and responses]. Evidence: [specific chat examples showing power dynamics, control patterns, and relationship rules]",
      metadata: {
        category: "relationship",
        priority: 5,
        confidence: 0.85,
        color: "red",
        icon: "users"
      }
    }, null, 2),
    category: "relationship",
    icon: "⚖️",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Quantitative Communication Metrics",
    description: "Data-driven analysis of response timing, interaction rhythms, conversational momentum, and linguistic fingerprinting patterns.",
    instructionPrompt: `Conduct quantitative analysis of communication patterns and timing dynamics.

ANALYZE:
1. RESPONSE TIMING PATTERNS: Delays, accelerations, and what they reveal psychologically
2. INTERACTION RHYTHM: Daily/weekly messaging patterns and energy cycles  
3. CONVERSATIONAL MOMENTUM: Who initiates threads, who terminates, energy flow
4. LINGUISTIC FINGERPRINTING: 
   - Lexical Diversity (vocabulary richness)
   - Sentence Complexity (structure sophistication)
   - Question/Statement Ratio (communication style)
   - Emoji Valence (emotional expression patterns)
5. MESSAGE LENGTH PATTERNS: Verbosity vs brevity and what it indicates
6. TOPIC INITIATION: Who brings up new subjects and themes
7. ENGAGEMENT METRICS: Response rates, continuation patterns

Provide specific data points and psychological interpretation of timing patterns.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Communication Timing Analysis", 
      content: [
        {"timeframe": "Morning", "avgResponseTime": 15, "pattern": "Quick engagement", "interpretation": "High availability and priority"},
        {"timeframe": "Afternoon", "avgResponseTime": 120, "pattern": "Delayed responses", "interpretation": "Lower emotional availability"},
        {"timeframe": "Evening", "avgResponseTime": 5, "pattern": "Immediate responses", "interpretation": "Peak emotional investment"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "timingData",
        xDataKey: "timeframe", 
        yDataKey: "avgResponseTime",
        colorSchemeHint: "categorical",
        mainColor: "#10B981",
        unit: "Minutes",
        descriptionShort: "Response timing patterns reveal psychological availability and relationship priority",
        category: "data",
        priority: 4,
        confidence: 0.9
      }
    }, null, 2),
    category: "data",
    icon: "📊",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Subtext & Hidden Intention Decoder",
    description: "Analyzes ambiguous messages for hidden meanings, tactical communication, plausible deniability, and covert influence attempts.",
    instructionPrompt: `Decode the subtext and hidden intentions behind ambiguous or loaded messages.

ANALYZE:
1. AMBIGUOUS MESSAGE IDENTIFICATION: Select 3-5 most strategically ambiguous quotes
2. SURFACE vs HIDDEN MEANING: Literal interpretation vs likely covert intention
3. TACTICAL COMMUNICATION PATTERNS:
   - Plausible Deniability (saying one thing while meaning another)
   - Fishing for Reassurance (indirect validation seeking)
   - Testing Boundaries (probing limits)
   - Emotional Manipulation (guilt, obligation, fear)
   - Strategic Ambiguity (keeping options open)
4. COVERT INFLUENCE ATTEMPTS: Subtle persuasion, pressure, or control
5. DEFENSIVENESS PATTERNS: Deflection, projection, rationalization
6. VALIDATION SEEKING: Indirect requests for approval or attention

For each ambiguous message, provide: original quote, surface meaning, hidden intention, tactical label, confidence level.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Subtext Analysis: Key Ambiguous Messages",
      content: "QUOTE 1: '[exact message]' - SURFACE: [literal meaning] - HIDDEN: [likely intention] - TACTIC: [e.g., Plausible Deniability] - CONFIDENCE: High/Medium/Low. QUOTE 2: [analysis]. QUOTE 3: [analysis]. PATTERNS: [overall subtext strategies identified]",
      metadata: {
        category: "subtext", 
        priority: 4,
        confidence: 0.8,
        color: "yellow",
        icon: "search"
      }
    }, null, 2),
    category: "subtext",
    icon: "🔍",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Strategic Forecasting & Narrative Analysis", 
    description: "Predictive analysis including narrative arc mapping, future trajectory forecasting, potential flashpoints, and unresolved tensions.",
    instructionPrompt: `Conduct strategic analysis and predictive forecasting based on identified patterns.

ANALYZE:
1. NARRATIVE ARC MAPPING: Divide the relationship into thematic "eras"
   - Era 1: [timeframe] - [theme] (e.g., Idealization, Testing, Conflict, etc.)
   - Era 2: [timeframe] - [theme] 
   - Era 3: [timeframe] - [theme]
   - Key Turning Points: [pivotal moments with quotes]
2. FUTURE TRAJECTORY: Most likely outcome based on psychological patterns
3. POTENTIAL FLASHPOINTS: Specific triggers likely to cause future conflict
4. UNRESOLVED TENSIONS: Core psychological/relational incompatibilities
5. ESCALATION/DE-ESCALATION PATTERNS: What makes things better or worse
6. INTERVENTION OPPORTUNITIES: Where different approaches could change outcomes
7. PSYCHOLOGICAL MOMENTUM: Current direction and energy of the dynamic

Provide specific predictions with supporting psychological reasoning.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Strategic Forecast & Narrative Analysis",
      content: "NARRATIVE ARC: Era 1 ([timeframe]) - [theme description]. Era 2 ([timeframe]) - [theme]. Era 3 ([timeframe]) - [theme]. KEY TURNING POINTS: [pivotal moments with supporting quotes]. FUTURE TRAJECTORY: [most likely outcome based on patterns]. POTENTIAL FLASHPOINTS: [specific conflict triggers]. UNRESOLVED TENSIONS: [core incompatibilities]. INTERVENTION OPPORTUNITIES: [potential positive changes]",
      metadata: {
        category: "predictive",
        priority: 5,
        confidence: 0.75,
        color: "cyan", 
        icon: "trending-up"
      }
    }, null, 2),
    category: "predictive",
    icon: "🔮",
    isActive: true,
    isBuiltIn: true,
  }
];

async function createForensicModules() {
  try {
    console.log('🔍 Creating Forensic Analysis modules...');

    let createdCount = 0;
    let skippedCount = 0;

    for (const moduleData of forensicModules) {
      // Check if module already exists
      const existingModule = await prisma.analysisModule.findFirst({
        where: { name: moduleData.name }
      });

      if (existingModule) {
        console.log(`⚠️  Module "${moduleData.name}" already exists. Skipping.`);
        skippedCount++;
        continue;
      }

      // Create the module
      const module = await prisma.analysisModule.create({
        data: moduleData
      });

      console.log(`✅ Created module: ${module.name}`);
      createdCount++;
    }

    console.log('🎉 Forensic Analysis modules processing completed!');
    console.log(`📊 Summary:`);
    console.log(`   Created: ${createdCount} modules`);
    console.log(`   Skipped: ${skippedCount} modules (already exist)`);
    console.log(`   Total: ${forensicModules.length} modules processed`);

    if (createdCount > 0) {
      console.log(`\n🔍 Created Forensic Modules:`);
      forensicModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.name} (${module.category})`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating forensic modules:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createForensicModules(); 