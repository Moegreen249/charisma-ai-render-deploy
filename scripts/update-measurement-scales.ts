import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function updateMeasurementScales() {
  console.log('🔄 Updating measurement scales from 0.0-1.0 to 1-100...\n');

  // Read the enhanced templates file
  const filePath = join(process.cwd(), 'lib', 'enhanced-templates.ts');
  let content = readFileSync(filePath, 'utf-8');
  
  let changes = 0;

  // Function to convert decimal score to 1-100 scale
  function convertScore(match: string, score: string) {
    const numScore = parseFloat(score);
    if (numScore >= 0 && numScore <= 1) {
      changes++;
      return match.replace(score, Math.round(numScore * 100).toString());
    }
    return match;
  }

  // Update decimal scores in content fields
  content = content.replace(/"content":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in score fields
  content = content.replace(/"score":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in level fields
  content = content.replace(/"level":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in rating fields
  content = content.replace(/"rating":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in effectiveness fields
  content = content.replace(/"effectiveness":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in progress fields  
  content = content.replace(/"progress":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in clarity fields
  content = content.replace(/"clarity":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update decimal scores in action fields
  content = content.replace(/"action":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update confidence scores (0.0-1.0 to 1-100)
  content = content.replace(/"confidence":\s*(0\.\d+)/g, (match, score) => 
    convertScore(match, score)
  );

  // Update metrics in JSON examples
  const metricsPatterns = [
    'communicationEffectiveness',
    'emotionalIntelligence', 
    'activeListening',
    'empathyLevel',
    'clarityScore',
    'persuasivenessRating',
    'rapportBuilding',
    'relationshipHealth',
    'emotionalIntimacy',
    'conflictResolution',
    'trustLevel',
    'communicationQuality',
    'attachmentSecurity',
    'supportQuality',
    'leadershipEffectiveness',
    'decisionMakingQuality',
    'teamCollaboration',
    'strategicThinking',
    'communicationClarity',
    'meetingEffectiveness',
    'changeLeadership',
    'coachingEffectiveness',
    'goalProgress',
    'changeReadiness',
    'selfAwareness',
    'actionOrientation',
    'learningEngagement',
    'motivationLevel'
  ];

  metricsPatterns.forEach(metric => {
    content = content.replace(
      new RegExp(`"${metric}":\\s*(0\\.\\d+)`, 'g'),
      (match, score) => convertScore(match, score)
    );
  });

  // Update unit descriptions
  content = content.replace(/Effectiveness Score/g, 'Effectiveness Score (1-100)');
  content = content.replace(/Intensity Score/g, 'Intensity Score (1-100)');
  content = content.replace(/Relevance Score/g, 'Relevance Score (1-100)');
  content = content.replace(/Confidence Score/g, 'Confidence Score (1-100)');
  content = content.replace(/Quality Score/g, 'Quality Score (1-100)');

  // Update scale references in descriptions
  content = content.replace(/0\.0 to 1\.0/g, '1 to 100');
  content = content.replace(/0-1 scale/g, '1-100 scale');
  content = content.replace(/decimal between 0 and 1/g, 'integer between 1 and 100');

  // Write the updated content back
  writeFileSync(filePath, content, 'utf-8');

  console.log(`✅ Updated ${changes} measurement values from 0.0-1.0 scale to 1-100 scale`);
  console.log('✅ Updated unit descriptions and scale references');
  console.log('✅ Enhanced templates now use 1-100 measurement scale\n');

  return { changes, filePath };
}

// Also update the analyze action to handle both scales for backward compatibility
function updateAnalyzeAction() {
  console.log('🔄 Updating analyze action to handle 1-100 scales...\n');

  const filePath = join(process.cwd(), 'app', 'actions', 'analyze.ts');
  let content = readFileSync(filePath, 'utf-8');

  // Add a helper function to normalize scores
  const helperFunction = `
// Helper function to normalize scores to consistent 1-100 scale
function normalizeScore(value: any): number {
  if (typeof value === 'number') {
    if (value >= 0 && value <= 1) {
      // Convert 0.0-1.0 scale to 1-100
      return Math.round(value * 100);
    } else if (value >= 1 && value <= 100) {
      // Already in 1-100 scale
      return Math.round(value);
    }
  }
  return 50; // Default middle value
}

// Normalize insight scores in analysis data
function normalizeInsightScores(insights: any[]): any[] {
  return insights.map(insight => {
    if (insight.type === 'score' && typeof insight.content === 'number') {
      insight.content = normalizeScore(insight.content);
    }
    
    if (insight.content && Array.isArray(insight.content)) {
      insight.content = insight.content.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          ['score', 'level', 'rating', 'effectiveness', 'progress', 'clarity', 'action'].forEach(field => {
            if (item[field] !== undefined) {
              item[field] = normalizeScore(item[field]);
            }
          });
        }
        return item;
      });
    }
    
    return insight;
  });
}
`;

  // Insert the helper function before the analyzeChat function
  const insertPoint = content.indexOf('export async function analyzeChat(formData: FormData)');
  if (insertPoint !== -1) {
    content = content.slice(0, insertPoint) + helperFunction + '\n' + content.slice(insertPoint);
  }

  // Add normalization call before returning the validated data
  const returnPoint = content.indexOf('return {\n      success: true,\n      data: validatedData,');
  if (returnPoint !== -1) {
    const beforeReturn = content.slice(0, returnPoint);
    const afterReturn = content.slice(returnPoint);
    
    const normalizationCode = `    // Normalize measurement scales to 1-100
    if (validatedData.insights) {
      validatedData.insights = normalizeInsightScores(validatedData.insights);
    }
    
    // Normalize metrics to 1-100 scale
    if (validatedData.metrics) {
      Object.keys(validatedData.metrics).forEach(key => {
        if (typeof validatedData.metrics[key] === 'number') {
          validatedData.metrics[key] = normalizeScore(validatedData.metrics[key]);
        }
      });
    }

    `;
    
    content = beforeReturn + normalizationCode + afterReturn;
  }

  writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Updated analyze action with score normalization');
  console.log('✅ Added backward compatibility for mixed measurement scales\n');
}

// Run the updates
try {
  const result = updateMeasurementScales();
  updateAnalyzeAction();
  
  console.log('🎉 Measurement scale update completed successfully!');
  console.log(`📊 All analysis now uses consistent 1-100 measurement scale`);
  console.log(`🔄 Backward compatibility maintained for existing data`);
  
} catch (error) {
  console.error('❌ Error updating measurement scales:', error);
  process.exit(1);
} 