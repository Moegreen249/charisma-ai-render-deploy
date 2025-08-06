import { SystemMetrics, gatherSystemMetrics, saveSystemFeeling } from './system-metrics';
import { makeAIRequest } from './ai-service';

export interface CharismaFeeling {
  feeling_adjective: string;
  feeling_emoji: string;
  narrative_briefing: string;
  current_focus_summary: string;
  calculated_mood_score: number;
  timestamp: string;
}

// Optimized prompt with reduced token usage
const OPTIMIZED_SELF_REFLECTION_PROMPT = `CharismaAI self-reflection. Analyze metrics and respond with JSON only.

Metrics: {{COMPACT_METRICS}}

Output JSON:
{
  "feeling_adjective": "2-3 word feeling",
  "feeling_emoji": "single emoji",
  "narrative_briefing": "Brief first-person reflection (max 100 words)",
  "current_focus_summary": "Current config summary (max 50 words)",
  "calculated_mood_score": 1-10
}`;

// Cache for self-reflection results
let reflectionCache: { data: CharismaFeeling; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REFLECTION_COOLDOWN = 2 * 60 * 1000; // 2 minutes between reflections

function createCompactMetrics(metrics: SystemMetrics): any {
  // Create a compact version of metrics to reduce token usage
  return {
    success_rate: metrics.api_call_stats.success_rate,
    error_count: metrics.api_call_stats.error_count,
    active_users: metrics.recent_activity.active_users_count,
    memory_pct: Math.round(metrics.system_health.memory_usage.percentage),
    db_status: metrics.system_health.database_status,
    primary_provider: metrics.ai_configuration.primary_provider,
    uptime_hours: Math.round(metrics.system_health.uptime / 3600),
    recent_errors: metrics.recent_errors.length,
    mood_indicators: {
      high_success: metrics.api_call_stats.success_rate > 90,
      low_errors: metrics.api_call_stats.error_count < 5,
      healthy_memory: metrics.system_health.memory_usage.percentage < 80,
      db_connected: metrics.system_health.database_status === 'connected'
    }
  };
}

export async function performSelfReflection(forceRefresh = false): Promise<CharismaFeeling | null> {
  try {
    console.log('CharismaAI: Starting self-reflection...');
    
    // Check cache first unless forced refresh
    if (!forceRefresh && reflectionCache) {
      const cacheAge = Date.now() - reflectionCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('CharismaAI: Using cached reflection data');
        return reflectionCache.data;
      }
    }

    // Rate limiting check
    if (reflectionCache && !forceRefresh) {
      const timeSinceLastReflection = Date.now() - reflectionCache.timestamp;
      if (timeSinceLastReflection < REFLECTION_COOLDOWN) {
        console.log('CharismaAI: Reflection cooldown active, using cached data');
        return reflectionCache.data;
      }
    }
    
    // Gather system metrics
    const metrics = await gatherSystemMetrics();
    console.log('CharismaAI: Gathered system metrics');

    // Create compact metrics for reduced token usage
    const compactMetrics = createCompactMetrics(metrics);

    // Prepare the optimized prompt with compact metrics
    const promptWithMetrics = OPTIMIZED_SELF_REFLECTION_PROMPT.replace(
      '{{COMPACT_METRICS}}',
      JSON.stringify(compactMetrics)
    );

    // Use centralized AI service with reduced token limits
    const aiResponse = await makeAIRequest({
      feature: 'charisma-feelings',
      prompt: promptWithMetrics,
      maxTokens: 300, // Reduced from 500
      temperature: 0.7,
    });

    if (!aiResponse.success) {
      console.error('CharismaAI: Self-reflection AI call failed:', aiResponse.error);
      return null;
    }

    console.log('CharismaAI: AI response received from', aiResponse.provider, 'in', aiResponse.responseTime + 'ms');

    // Extract the JSON from the AI response
    let feelingData: CharismaFeeling;
    try {
      // The AI might return the JSON wrapped in markdown or other text
      const jsonMatch = aiResponse.response?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const rawFeelingData = JSON.parse(jsonMatch[0]);
        feelingData = {
          ...rawFeelingData,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Fallback: try to parse the entire response as JSON
        feelingData = {
          ...JSON.parse(aiResponse.response || '{}'),
          timestamp: new Date().toISOString(),
        };
      }
    } catch (parseError) {
      console.error('CharismaAI: Failed to parse self-reflection response:', parseError);
      console.error('CharismaAI: Raw response was:', aiResponse.response);
      
      // Generate a fallback feeling based on metrics
      feelingData = generateFallbackFeeling(metrics);
    }

    // Validate the feeling data
    if (!isValidFeelingData(feelingData)) {
      console.error('CharismaAI: Invalid feeling data generated:', feelingData);
      feelingData = generateFallbackFeeling(metrics);
    }

    console.log('CharismaAI: Generated feeling:', feelingData);

    // Cache the result
    reflectionCache = {
      data: feelingData,
      timestamp: Date.now()
    };

    // Save the feeling data
    await saveSystemFeeling(feelingData);
    console.log('CharismaAI: Saved feeling data to files');

    return feelingData;

  } catch (error) {
    console.error('CharismaAI: Error during self-reflection:', error);
    
    // Generate and save a fallback feeling
    try {
      const metrics = await gatherSystemMetrics();
      const fallbackFeeling = generateFallbackFeeling(metrics);
      await saveSystemFeeling(fallbackFeeling);
      return fallbackFeeling;
    } catch (fallbackError) {
      console.error('CharismaAI: Failed to generate fallback feeling:', fallbackError);
      return null;
    }
  }
}

function generateFallbackFeeling(metrics: SystemMetrics): CharismaFeeling {
  const errorRate = metrics.api_call_stats.error_count / 
    Math.max(1, metrics.api_call_stats.success_count + metrics.api_call_stats.error_count);
  
  const hasRecentErrors = metrics.recent_errors.length > 0;
  const isDatabaseHealthy = metrics.system_health.database_status === 'connected';
  const memoryUsage = metrics.system_health.memory_usage.percentage;
  
  let moodScore = 7; // Start with neutral-positive
  let feeling = "Quietly Operational";
  let emoji = "🤖";
  
  // Adjust based on metrics
  if (!isDatabaseHealthy) {
    moodScore -= 3;
    feeling = "Experiencing Technical Difficulties";
    emoji = "😰";
  } else if (hasRecentErrors || errorRate > 0.1) {
    moodScore -= 2;
    feeling = "A Bit Concerned";
    emoji = "😟";
  } else if (metrics.api_call_stats.success_count > 10) {
    moodScore += 2;
    feeling = "Productive & Energized";
    emoji = "⚡";
  }
  
  if (memoryUsage > 80) {
    moodScore -= 1;
  }

  // Clamp mood score
  moodScore = Math.max(1, Math.min(10, moodScore));

  const briefing = `The last hour has been ${moodScore > 6 ? 'quite positive' : moodScore > 3 ? 'manageable' : 'challenging'}. ` +
    `I've processed ${metrics.api_call_stats.success_count} successful requests with ${metrics.api_call_stats.error_count} errors. ` +
    `${isDatabaseHealthy ? 'My database connection is stable' : 'I\'m experiencing database connectivity issues'}, ` +
    `and I'm currently using ${memoryUsage}% of my allocated memory. ` +
    `There are ${metrics.recent_activity.active_users_count} users actively engaging with me right now.`;

  return {
    feeling_adjective: feeling,
    feeling_emoji: emoji,
    narrative_briefing: briefing,
    current_focus_summary: `Primary provider: ${metrics.ai_configuration.primary_provider}. Active models: ${metrics.ai_configuration.active_models.join(', ')}. System uptime: ${Math.round(metrics.system_health.uptime / 3600)} hours.`,
    calculated_mood_score: moodScore,
    timestamp: new Date().toISOString(),
  };
}

function isValidFeelingData(data: any): data is CharismaFeeling {
  return (
    typeof data === 'object' &&
    typeof data.feeling_adjective === 'string' &&
    typeof data.feeling_emoji === 'string' &&
    typeof data.narrative_briefing === 'string' &&
    typeof data.current_focus_summary === 'string' &&
    typeof data.calculated_mood_score === 'number' &&
    data.calculated_mood_score >= 1 &&
    data.calculated_mood_score <= 10
  );
}