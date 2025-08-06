import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const allEnhancedModules = [
  // COMMUNICATION ANALYSIS MODULES
  {
    name: "Communication Effectiveness Assessment",
    description: "Analyzes clarity, active listening, empathy, persuasion techniques, and rapport building in conversations using advanced communication frameworks.",
    instructionPrompt: `Analyze the communication effectiveness using advanced linguistic and psychological frameworks.

ANALYZE:
1. CLARITY & PRECISION: How clearly ideas are expressed, message structure, coherence
2. ACTIVE LISTENING INDICATORS: Evidence of understanding, engagement, attention quality
3. EMPATHY & EMOTIONAL INTELLIGENCE: Recognition and response to emotions, emotional awareness
4. PERSUASION & INFLUENCE: Effective use of persuasive techniques, influence strategies
5. RAPPORT BUILDING: Connection establishment, trust building, relationship maintenance
6. LINGUISTIC SOPHISTICATION: Vocabulary use, syntactic complexity, discourse markers
7. COMMUNICATION BARRIERS: Misunderstandings, assumptions, emotional blocks
8. ENHANCEMENT OPPORTUNITIES: Specific improvements for communication effectiveness

Provide specific evidence from the conversation and actionable improvement recommendations.`,
    expectedJsonHint: JSON.stringify({
      type: "score",
      title: "Communication Effectiveness Score",
      content: 0.85,
      metadata: {
        category: "effectiveness",
        priority: 5,
        confidence: 0.9,
        unit: "Effectiveness Score",
        color: "blue",
        icon: "message-circle"
      }
    }, null, 2),
    category: "communication",
    icon: "💬",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Emotional Intelligence in Communication",
    description: "Evaluates emotional intelligence components including self-awareness, empathy, emotional regulation, and social skills in conversational contexts.",
    instructionPrompt: `Assess emotional intelligence components demonstrated in the conversation.

ANALYZE:
1. SELF-AWARENESS: Recognition of own emotional states, triggers, and reactions
2. EMPATHY: Understanding and response to others' emotions, perspective-taking
3. EMOTIONAL REGULATION: Managing emotional responses, staying composed under pressure
4. SOCIAL SKILLS: Navigating social dynamics, reading social cues, relationship management
5. EMOTIONAL EXPRESSION: Appropriate emotional communication, emotional vocabulary
6. VALIDATION PATTERNS: Providing and seeking emotional validation, support behaviors
7. EMOTIONAL CONTAGION: How emotions spread between participants
8. EMOTIONAL INTELLIGENCE DEVELOPMENT: Growth opportunities and recommendations

Rate each component and provide specific behavioral evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Emotional Intelligence Components",
      content: [
        {"component": "Self-Awareness", "score": 0.8, "evidence": "Recognizes own emotional states"},
        {"component": "Empathy", "score": 0.7, "evidence": "Shows understanding of others' feelings"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "emotionalIntelligence",
        xDataKey: "component",
        yDataKey: "score",
        colorSchemeHint: "categorical",
        mainColor: "#3B82F6",
        unit: "EQ Score",
        descriptionShort: "Emotional intelligence components analysis",
        category: "emotional",
        priority: 4,
        confidence: 0.85
      }
    }, null, 2),
    category: "emotional",
    icon: "❤️",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Communication Barriers & Enhancers Analysis",
    description: "Identifies factors that hinder or help effective communication including assumptions, emotional blocks, clarification behaviors, and validation patterns.",
    instructionPrompt: `Identify communication barriers and enhancers affecting conversation effectiveness.

ANALYZE:
1. COMMUNICATION BARRIERS:
   - Assumptions and misunderstandings
   - Emotional reactivity and defensive responses
   - Language complexity mismatches
   - Cultural or contextual misalignments
   - Attention and focus issues
2. COMMUNICATION ENHANCERS:
   - Clarifying questions and confirmation
   - Active listening demonstrations
   - Emotional validation and support
   - Adaptive communication styles
   - Patience and understanding
3. FREQUENCY & IMPACT: How often barriers/enhancers occur and their effect
4. MITIGATION STRATEGIES: How barriers are addressed or could be addressed
5. OPTIMIZATION OPPORTUNITIES: Ways to increase enhancers and reduce barriers

Categorize each factor and assess its impact on communication quality.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Communication Barriers & Enhancers",
      content: [
        {"type": "Barrier", "factor": "Assumptions", "frequency": 3, "impact": "Medium"},
        {"type": "Enhancer", "factor": "Clarifying Questions", "frequency": 5, "impact": "High"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "communicationFactors",
        xDataKey: "factor",
        yDataKey: "frequency",
        colorSchemeHint: "categorical",
        mainColor: "#F59E0B",
        unit: "Frequency",
        descriptionShort: "Factors that help or hinder effective communication",
        category: "barriers",
        priority: 3,
        confidence: 0.8
      }
    }, null, 2),
    category: "communication",
    icon: "🚧",
    isActive: true,
    isBuiltIn: true,
  },

  // RELATIONSHIP ANALYSIS MODULES
  {
    name: "Attachment Style & Security Analysis",
    description: "Analyzes attachment patterns, security indicators, and attachment-based behaviors using advanced attachment theory frameworks.",
    instructionPrompt: `Analyze attachment styles and security patterns using attachment theory frameworks.

ANALYZE:
1. ATTACHMENT STYLE INDICATORS:
   - Secure: Comfortable with intimacy and autonomy
   - Anxious-Preoccupied: High need for closeness, fear of abandonment
   - Dismissive-Avoidant: Values independence, discomfort with closeness
   - Fearful-Avoidant: Wants closeness but fears rejection
2. SECURITY BEHAVIORS: Trust, emotional regulation, effective communication
3. INSECURITY PATTERNS: Anxiety, avoidance, ambivalence, protest behaviors
4. ATTACHMENT WOUNDS: Past trauma affecting current relationship patterns
5. CAREGIVING & CARE-SEEKING: How support is provided and requested
6. PROXIMITY SEEKING: Comfort with closeness and connection
7. SAFE HAVEN & SECURE BASE: Relationship as source of comfort and exploration support

Identify specific behavioral evidence and attachment implications.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Attachment Style Analysis",
      content: "Detailed analysis of attachment patterns with behavioral evidence: SECURE INDICATORS (trust, emotional regulation), ANXIOUS PATTERNS (fear of abandonment, reassurance seeking), AVOIDANT BEHAVIORS (independence emphasis, discomfort with closeness). Evidence: [specific examples from conversation]",
      metadata: {
        category: "attachment",
        priority: 5,
        confidence: 0.9,
        color: "blue",
        icon: "anchor"
      }
    }, null, 2),
    category: "relationship",
    icon: "⚓",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Intimacy Dimensions Assessment",
    description: "Evaluates multiple intimacy dimensions including emotional, intellectual, physical, and spiritual connections using relationship psychology frameworks.",
    instructionPrompt: `Assess intimacy levels across multiple dimensions using relationship psychology frameworks.

ANALYZE:
1. EMOTIONAL INTIMACY:
   - Vulnerability sharing and emotional openness
   - Empathy and emotional understanding
   - Emotional support and validation
   - Comfort with emotional expression
2. INTELLECTUAL INTIMACY:
   - Idea sharing and mental stimulation
   - Curiosity about partner's thoughts
   - Intellectual respect and engagement
   - Meaningful conversations and discussions
3. PHYSICAL INTIMACY INDICATORS:
   - Comfort with physical closeness
   - Affection expression and reception
   - Physical touch preferences and boundaries
4. SPIRITUAL INTIMACY:
   - Shared values and belief systems
   - Meaning and purpose discussions
   - Moral and ethical alignment
5. INTIMACY DEVELOPMENT: How intimacy deepens or remains surface-level
6. INTIMACY BARRIERS: What prevents deeper connection

Rate each dimension and provide supporting evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Intimacy Dimensions Assessment",
      content: [
        {"dimension": "Emotional Intimacy", "level": 0.8, "indicators": "Vulnerability sharing, empathy"},
        {"dimension": "Intellectual Intimacy", "level": 0.7, "indicators": "Idea sharing, curiosity"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "intimacyData",
        xDataKey: "dimension",
        yDataKey: "level",
        colorSchemeHint: "categorical",
        mainColor: "#FF69B4",
        unit: "Intimacy Level",
        descriptionShort: "Multi-dimensional intimacy assessment",
        category: "intimacy",
        priority: 5,
        confidence: 0.85
      }
    }, null, 2),
    category: "relationship",
    icon: "💕",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Conflict Resolution & Gottman Analysis",
    description: "Analyzes conflict patterns using Gottman Method frameworks including Four Horsemen, repair attempts, and conflict resolution effectiveness.",
    instructionPrompt: `Analyze conflict dynamics using Gottman Method and conflict resolution frameworks.

ANALYZE:
1. GOTTMAN'S FOUR HORSEMEN:
   - Criticism: Attacking character vs. addressing behavior
   - Contempt: Superiority, sarcasm, eye-rolling, mockery
   - Defensiveness: Playing victim, counter-attacking
   - Stonewalling: Emotional withdrawal, shutting down
2. CONFLICT STYLES:
   - Competing: Win-lose, assertive but uncooperative
   - Accommodating: Lose-win, unassertive but cooperative
   - Avoiding: Lose-lose, unassertive and uncooperative
   - Compromising: Partial win-win, moderate assertiveness and cooperation
   - Collaborating: Win-win, assertive and cooperative
3. REPAIR ATTEMPTS: Efforts to de-escalate and reconnect during conflict
4. CONFLICT TRIGGERS: What initiates disagreements and tension
5. RESOLUTION PATTERNS: How conflicts end and what remains unresolved
6. AFTERMATH: How participants feel and behave after conflicts

Identify specific patterns with supporting evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Conflict Resolution Analysis",
      content: "GOTTMAN ANALYSIS: Four Horsemen presence/absence [specific examples]. CONFLICT STYLE: [dominant approach with evidence]. REPAIR ATTEMPTS: [de-escalation efforts]. RESOLUTION EFFECTIVENESS: [outcome assessment]. Evidence: [specific examples]",
      metadata: {
        category: "conflict",
        priority: 4,
        confidence: 0.8,
        color: "orange",
        icon: "shield"
      }
    }, null, 2),
    category: "relationship",
    icon: "⚔️",
    isActive: true,
    isBuiltIn: true,
  },

  // BUSINESS ANALYSIS MODULES
  {
    name: "Leadership Competencies Assessment",
    description: "Evaluates leadership effectiveness using comprehensive leadership frameworks including strategic thinking, decision-making, team building, and change leadership.",
    instructionPrompt: `Assess leadership competencies using advanced leadership development frameworks.

ANALYZE:
1. STRATEGIC THINKING:
   - Long-term vision and planning
   - Systems thinking and connections
   - Strategic decision-making
   - Innovation and future orientation
2. DECISION-MAKING QUALITY:
   - Data-driven analysis
   - Stakeholder consultation
   - Risk assessment and mitigation
   - Timely and decisive actions
3. TEAM BUILDING & COLLABORATION:
   - Team motivation and engagement
   - Talent development and coaching
   - Inclusive leadership behaviors
   - Conflict mediation and resolution
4. COMMUNICATION & INFLUENCE:
   - Clear and compelling messaging
   - Stakeholder management
   - Persuasion and negotiation
   - Executive presence
5. CHANGE LEADERSHIP:
   - Change vision and communication
   - Resistance management
   - Adaptation and flexibility
   - Transformation capability

Rate each competency with specific behavioral evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Leadership Competencies Assessment",
      content: [
        {"competency": "Strategic Thinking", "score": 0.9, "evidence": "Long-term planning and systems thinking"},
        {"competency": "Decision Making", "score": 0.8, "evidence": "Data-driven and timely decisions"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "leadershipData",
        xDataKey: "competency",
        yDataKey: "score",
        colorSchemeHint: "categorical",
        mainColor: "#1E40AF",
        unit: "Competency Score",
        descriptionShort: "Key leadership competencies evaluation",
        category: "leadership",
        priority: 5,
        confidence: 0.85
      }
    }, null, 2),
    category: "business",
    icon: "👑",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Team Dynamics & Psychological Safety",
    description: "Analyzes team collaboration patterns, psychological safety indicators, participation balance, and team performance factors.",
    instructionPrompt: `Analyze team dynamics and psychological safety using organizational psychology frameworks.

ANALYZE:
1. PSYCHOLOGICAL SAFETY:
   - Comfort with risk-taking and error admission
   - Open disagreement and debate
   - Help-seeking behavior comfort
   - Idea sharing without fear of judgment
2. PARTICIPATION PATTERNS:
   - Speaking time distribution
   - Idea contribution balance
   - Engagement and involvement levels
   - Inclusion and exclusion dynamics
3. COLLABORATION EFFECTIVENESS:
   - Information sharing quality
   - Collective problem-solving
   - Mutual support and assistance
   - Shared accountability
4. TEAM PERFORMANCE INDICATORS:
   - Goal alignment and focus
   - Decision-making efficiency
   - Innovation and creativity
   - Results orientation
5. CONFLICT & DIVERSITY:
   - Constructive disagreement handling
   - Diverse perspective integration
   - Bias recognition and mitigation

Assess team health with specific behavioral evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Team Dynamics & Psychological Safety",
      content: "PSYCHOLOGICAL SAFETY: [indicators of safety/fear]. PARTICIPATION: [balance assessment]. COLLABORATION: [effectiveness evidence]. PERFORMANCE: [goal alignment and results focus]. Evidence: [specific examples]",
      metadata: {
        category: "team",
        priority: 4,
        confidence: 0.85,
        color: "purple",
        icon: "users"
      }
    }, null, 2),
    category: "business",
    icon: "👥",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Meeting Effectiveness & Management",
    description: "Evaluates meeting management quality including agenda adherence, time management, decision-making, and action item clarity.",
    instructionPrompt: `Analyze meeting effectiveness using meeting management best practices frameworks.

ANALYZE:
1. MEETING STRUCTURE & PLANNING:
   - Agenda clarity and adherence
   - Objective setting and achievement
   - Time allocation and management
   - Preparation and organization
2. FACILITATION QUALITY:
   - Discussion leadership
   - Participation encouragement
   - Conflict mediation
   - Focus maintenance
3. DECISION-MAKING PROCESS:
   - Information gathering adequacy
   - Option consideration thoroughness
   - Consensus building effectiveness
   - Decision clarity and commitment
4. ACTION ITEM MANAGEMENT:
   - Responsibility assignment clarity
   - Deadline specification
   - Follow-up planning
   - Accountability establishment
5. MEETING OUTCOMES:
   - Goal achievement level
   - Participant satisfaction
   - Next steps clarity
   - Value creation assessment

Rate meeting effectiveness components with specific evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Meeting Effectiveness Metrics",
      content: [
        {"metric": "Agenda Adherence", "score": 0.8, "impact": "High"},
        {"metric": "Decision Quality", "score": 0.9, "impact": "High"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "meetingData",
        xDataKey: "metric",
        yDataKey: "score",
        colorSchemeHint: "categorical",
        mainColor: "#059669",
        unit: "Effectiveness Score",
        descriptionShort: "Meeting management and effectiveness analysis",
        category: "meeting",
        priority: 3,
        confidence: 0.8
      }
    }, null, 2),
    category: "business",
    icon: "📊",
    isActive: true,
    isBuiltIn: true,
  },

  // COACHING ANALYSIS MODULES
  {
    name: "Goal Achievement & Progress Assessment",
    description: "Analyzes goal clarity, SMART criteria, progress indicators, and achievement momentum using goal psychology frameworks.",
    instructionPrompt: `Assess goal achievement progress using goal psychology and coaching frameworks.

ANALYZE:
1. SMART GOAL CRITERIA:
   - Specific: Clear and well-defined objectives
   - Measurable: Quantifiable progress indicators
   - Achievable: Realistic and attainable targets
   - Relevant: Alignment with values and priorities
   - Time-bound: Clear deadlines and timelines
2. PROGRESS INDICATORS:
   - Milestone completion and advancement
   - Momentum and consistency patterns
   - Obstacle navigation and problem-solving
   - Resource utilization and support
3. MOTIVATION & COMMITMENT:
   - Intrinsic vs. extrinsic motivation
   - Commitment strength and consistency
   - Energy levels and enthusiasm
   - Persistence through challenges
4. IMPLEMENTATION EFFECTIVENESS:
   - Action plan quality and detail
   - Follow-through and accountability
   - Habit formation and routine building
   - Adaptation and adjustment capability
5. SUCCESS FACTORS & BARRIERS:
   - What supports goal achievement
   - What hinders progress and momentum
   - Environmental and personal factors

Rate goal achievement components with specific evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Goal Achievement Progress",
      content: [
        {"goal": "Career Transition", "progress": 0.7, "clarity": 0.9, "action": 0.6},
        {"goal": "Leadership Skills", "progress": 0.5, "clarity": 0.8, "action": 0.4}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "goalData",
        xDataKey: "goal",
        yDataKey: "progress",
        colorSchemeHint: "categorical",
        mainColor: "#F59E0B",
        unit: "Progress Score",
        descriptionShort: "Goal achievement progress and clarity assessment",
        category: "goals",
        priority: 5,
        confidence: 0.9
      }
    }, null, 2),
    category: "coaching",
    icon: "🎯",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Behavioral Change & Habit Formation",
    description: "Analyzes change readiness, stages of change, habit formation progress, and sustaining motivation using behavioral psychology frameworks.",
    instructionPrompt: `Analyze behavioral change progress using stages of change and habit formation frameworks.

ANALYZE:
1. STAGES OF CHANGE:
   - Precontemplation: Unaware of need for change
   - Contemplation: Considering change but ambivalent
   - Preparation: Planning and preparing for change
   - Action: Actively implementing new behaviors
   - Maintenance: Sustaining change over time
2. CHANGE READINESS:
   - Motivation strength and consistency
   - Confidence in ability to change
   - Importance of change to individual
   - Environmental support for change
3. HABIT FORMATION:
   - Cue identification and consistency
   - Routine establishment and practice
   - Reward recognition and reinforcement
   - Automaticity development
4. RESISTANCE PATTERNS:
   - Avoidance behaviors and excuses
   - Limiting beliefs and mental barriers
   - Environmental obstacles
   - Social and cultural resistance
5. SUSTAINING MOTIVATION:
   - Intrinsic motivation sources
   - Support system utilization
   - Progress celebration and recognition
   - Adaptation to setbacks

Identify change stage and provide supporting evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Behavioral Change Assessment",
      content: "CHANGE STAGE: [current stage with evidence]. READINESS: [motivation and confidence levels]. HABIT FORMATION: [progress in establishing new patterns]. RESISTANCE: [obstacles and barriers]. SUSTAINABILITY: [factors supporting long-term change]. Evidence: [specific examples]",
      metadata: {
        category: "change",
        priority: 4,
        confidence: 0.85,
        color: "green",
        icon: "refresh-cw"
      }
    }, null, 2),
    category: "coaching",
    icon: "🔄",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Coaching Relationship & Competencies",
    description: "Evaluates coaching effectiveness including active listening, powerful questions, goal setting, action planning, and accountability using ICF competencies.",
    instructionPrompt: `Assess coaching effectiveness using ICF (International Coach Federation) competencies framework.

ANALYZE:
1. ACTIVE LISTENING:
   - Presence and attention quality
   - Understanding demonstration
   - Reflection and paraphrasing
   - Non-judgmental listening
2. POWERFUL QUESTIONING:
   - Open-ended question usage
   - Insight-generating inquiries
   - Assumption challenging
   - Depth and exploration
3. GOAL SETTING & PLANNING:
   - Objective clarity and specificity
   - Action plan development
   - Timeline establishment
   - Resource identification
4. ACCOUNTABILITY & FOLLOW-THROUGH:
   - Progress tracking and review
   - Commitment reinforcement
   - Challenge and support balance
   - Responsibility ownership
5. COACHING PRESENCE:
   - Authenticity and genuineness
   - Confidence and competence
   - Flexibility and adaptability
   - Partnership creation
6. DIRECT COMMUNICATION:
   - Clarity and precision
   - Feedback quality
   - Truth-telling with compassion
   - Language effectiveness

Rate coaching competencies with specific behavioral evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Coaching Competencies Assessment",
      content: [
        {"competency": "Active Listening", "rating": 0.9, "evidence": "Deep attention and understanding"},
        {"competency": "Powerful Questions", "rating": 0.8, "evidence": "Insight-generating inquiries"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "coachingData",
        xDataKey: "competency",
        yDataKey: "rating",
        colorSchemeHint: "categorical",
        mainColor: "#8B5CF6",
        unit: "Competency Rating",
        descriptionShort: "Coaching skills and competencies evaluation",
        category: "coaching",
        priority: 4,
        confidence: 0.85
      }
    }, null, 2),
    category: "coaching",
    icon: "🎪",
    isActive: true,
    isBuiltIn: true,
  },

  // CLINICAL ANALYSIS MODULES
  {
    name: "Therapeutic Alliance & Communication Assessment",
    description: "Evaluates therapeutic relationship quality, communication patterns, trust building, and therapeutic presence using clinical psychology frameworks.",
    instructionPrompt: `Assess therapeutic alliance and communication quality using clinical psychology frameworks.

IMPORTANT DISCLAIMER: This analysis is observational only and NOT a clinical diagnosis.

ANALYZE:
1. THERAPEUTIC ALLIANCE:
   - Trust and safety establishment
   - Collaborative relationship quality
   - Working alliance strength
   - Therapeutic bond development
2. THERAPEUTIC COMMUNICATION:
   - Active listening and presence
   - Empathy and understanding
   - Validation and support
   - Boundary maintenance
3. CLIENT ENGAGEMENT:
   - Participation and openness
   - Resistance and defensiveness
   - Motivation for change
   - Treatment commitment
4. THERAPEUTIC PRESENCE:
   - Attunement and responsiveness
   - Authenticity and genuineness
   - Professional competence
   - Cultural sensitivity
5. COMMUNICATION BARRIERS:
   - Misunderstandings and confusion
   - Defensive responses
   - Trust or safety concerns
   - Language or cultural barriers

Rate alliance components with specific observational evidence.`,
    expectedJsonHint: JSON.stringify({
      type: "score",
      title: "Therapeutic Alliance Quality",
      content: 0.85,
      metadata: {
        category: "therapeutic",
        priority: 5,
        confidence: 0.8,
        unit: "Alliance Score",
        color: "blue",
        icon: "heart"
      }
    }, null, 2),
    category: "clinical",
    icon: "🤝",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Mental Health Indicators (Observational)",
    description: "Observational assessment of mood, anxiety, cognitive functioning, and behavioral patterns. NOT for diagnostic purposes.",
    instructionPrompt: `Conduct observational assessment of mental health indicators. 

CRITICAL DISCLAIMER: This is observational analysis only, NOT clinical diagnosis. For professional evaluation only.

OBSERVE:
1. MOOD INDICATORS:
   - Emotional tone and stability
   - Affect expression and range
   - Mood fluctuation patterns
   - Depression or elevation signs
2. ANXIETY PATTERNS:
   - Worry expression and intensity
   - Stress responses and reactions
   - Anxiety management strategies
   - Physical tension indicators
3. COGNITIVE FUNCTIONING:
   - Thought clarity and organization
   - Concentration and focus
   - Memory and recall
   - Decision-making capacity
4. BEHAVIORAL OBSERVATIONS:
   - Activity level and engagement
   - Social interaction comfort
   - Daily functioning indicators
   - Coping behavior patterns
5. RISK & PROTECTIVE FACTORS:
   - Safety concerns or indicators
   - Support system strength
   - Resilience factors
   - Crisis or warning signs

Provide observational data only with appropriate disclaimers.`,
    expectedJsonHint: JSON.stringify({
      type: "chart",
      title: "Mental Health Indicators (Observational)",
      content: [
        {"indicator": "Mood Stability", "level": 0.7, "trend": "Improving", "notes": "More consistent emotional tone"},
        {"indicator": "Anxiety Management", "level": 0.6, "trend": "Stable", "notes": "Moderate stress responses"}
      ],
      metadata: {
        chartTypeHint: "bar",
        dataKey: "mentalHealthData",
        xDataKey: "indicator",
        yDataKey: "level",
        colorSchemeHint: "categorical",
        mainColor: "#059669",
        unit: "Functioning Level",
        descriptionShort: "Observational mental health functioning indicators",
        category: "mental-health",
        priority: 4,
        confidence: 0.7
      }
    }, null, 2),
    category: "clinical",
    icon: "🧠",
    isActive: true,
    isBuiltIn: true,
  },
  {
    name: "Coping Mechanisms & Resilience Assessment",
    description: "Analyzes adaptive and maladaptive coping strategies, resilience factors, stress management approaches, and emotional regulation patterns.",
    instructionPrompt: `Assess coping mechanisms and resilience factors using clinical psychology frameworks.

ANALYZE:
1. ADAPTIVE COPING STRATEGIES:
   - Problem-focused coping
   - Emotion-focused healthy coping
   - Social support utilization
   - Meaning-making and reframing
2. MALADAPTIVE COPING PATTERNS:
   - Avoidance behaviors
   - Substance use indicators
   - Self-harm or destructive behaviors
   - Rumination and catastrophizing
3. RESILIENCE FACTORS:
   - Psychological flexibility
   - Self-efficacy and confidence
   - Social support networks
   - Optimism and hope
4. STRESS MANAGEMENT:
   - Stress recognition and awareness
   - Stress response patterns
   - Recovery and restoration
   - Stress prevention strategies
5. EMOTIONAL REGULATION:
   - Emotion awareness and labeling
   - Regulation strategies effectiveness
   - Emotional expression comfort
   - Distress tolerance capacity

Identify coping patterns with specific behavioral evidence and clinical observations.`,
    expectedJsonHint: JSON.stringify({
      type: "text",
      title: "Coping Mechanisms Assessment",
      content: "ADAPTIVE COPING: [healthy strategies with examples]. MALADAPTIVE PATTERNS: [concerning behaviors]. RESILIENCE FACTORS: [strengths and protective elements]. STRESS MANAGEMENT: [effectiveness and strategies]. EMOTIONAL REGULATION: [patterns and capacity]. Evidence: [specific examples]",
      metadata: {
        category: "coping",
        priority: 4,
        confidence: 0.8,
        color: "green",
        icon: "shield"
      }
    }, null, 2),
    category: "clinical",
    icon: "🛡️",
    isActive: true,
    isBuiltIn: true,
  }
];

async function createAllEnhancedModules() {
  try {
    console.log('🚀 Creating all enhanced analysis modules...');

    let createdCount = 0;
    let skippedCount = 0;

    for (const moduleData of allEnhancedModules) {
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

      console.log(`✅ Created module: ${module.name} (${module.category})`);
      createdCount++;
    }

    console.log('🎉 Enhanced analysis modules processing completed!');
    console.log(`📊 Summary:`);
    console.log(`   Created: ${createdCount} modules`);
    console.log(`   Skipped: ${skippedCount} modules (already exist)`);
    console.log(`   Total: ${allEnhancedModules.length} modules processed`);

    if (createdCount > 0) {
      console.log(`\n📚 Created Enhanced Modules by Category:`);
      
      const categories = [...new Set(allEnhancedModules.map(m => m.category))];
      categories.forEach(category => {
        const categoryModules = allEnhancedModules.filter(m => m.category === category);
        console.log(`\n${category.toUpperCase()} (${categoryModules.length} modules):`);
        categoryModules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.name}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error creating enhanced modules:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAllEnhancedModules(); 