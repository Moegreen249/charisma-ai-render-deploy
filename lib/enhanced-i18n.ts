// Enhanced Internationalization for CharismaAI with comprehensive translations
export type SupportedLanguage = "en" | "ar";

// Language detection from analysis results with better accuracy
export function detectLanguageCode(
  detectedLanguage: string,
): SupportedLanguage {
  const lang = detectedLanguage.toLowerCase();

  // Arabic variations and patterns
  if (
    lang.includes("عربية") ||
    lang.includes("arabic") ||
    lang.includes("العربية") ||
    lang.includes("عرب") ||
    lang.includes("arab") ||
    /[\u0600-\u06FF]/.test(lang) // Arabic Unicode range
  ) {
    return "ar";
  }

  // Default to English for everything else
  return "en";
}

// Comprehensive translation interface for enhanced analysis
export interface EnhancedTranslations {
  // Core App
  appTitle: string;
  appDescription: string;

  // Navigation & UI
  settings: string;
  history: string;
  analyzeConversation: string;
  analyzing: string;
  selectChatFile: string;
  upload: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  view: string;

  // Analysis Views
  overview: string;
  insights: string;
  categories: string;
  metrics: string;
  templateInsights: string;
  detailedAnalysis: string;

  // Core Analysis Elements
  personality: string;
  emotionalArc: string;
  topics: string;
  communicationPatterns: string;
  overallSummary: string;
  detectedLanguage: string;

  // Enhanced Insight Categories
  psychologyInsights: string;
  psychologyDescription: string;
  relationshipInsights: string;
  relationshipDescription: string;
  communicationInsights: string;
  communicationDescription: string;
  emotionalInsights: string;
  emotionalDescription: string;
  leadershipInsights: string;
  leadershipDescription: string;
  businessInsights: string;
  businessDescription: string;
  coachingInsights: string;
  coachingDescription: string;
  clinicalInsights: string;
  clinicalDescription: string;
  dataInsights: string;
  dataDescription: string;
  subtextInsights: string;
  subtextDescription: string;
  predictiveInsights: string;
  predictiveDescription: string;
  generalInsights: string;
  generalDescription: string;

  // Analysis Metrics & Stats
  totalInsights: string;
  highPriority: string;
  keyMetrics: string;
  topPriorityInsights: string;
  mostImportantFindings: string;
  confidenceScore: string;
  priorityLevel: string;

  // Filtering & Display
  filterBy: string;
  all: string;
  viewInsights: string;
  noInsightsFound: string;

  // Priority Levels
  critical: string;
  high: string;
  medium: string;
  low: string;
  info: string;

  // Chart & Visualization
  chartTitle: string;
  dataPoints: string;
  xAxis: string;
  yAxis: string;
  intensity: string;
  relevance: string;
  effectiveness: string;
  score: string;
  percentage: string;

  // Forensic Analysis Specific
  maskAnalysis: string;
  shadowAnalysis: string;
  coreDesireFear: string;
  attachmentStyle: string;
  powerDynamics: string;
  subtextDecoder: string;
  predictiveForecast: string;
  relationshipTrajectory: string;
  psychologicalProfile: string;

  // Communication Analysis
  emotionalIntelligence: string;
  activeListening: string;
  persuasionTechniques: string;
  communicationBarriers: string;
  rapportBuilding: string;
  empathyLevel: string;
  clarityScore: string;

  // Relationship Analysis
  intimacyDimensions: string;
  conflictResolution: string;
  loveLanguages: string;
  trustLevel: string;
  emotionalSupport: string;
  relationshipHealth: string;

  // Business Analysis
  leadershipCompetencies: string;
  teamDynamics: string;
  meetingEffectiveness: string;
  decisionMaking: string;
  strategicThinking: string;
  psychologicalSafety: string;

  // Coaching Analysis
  goalAchievement: string;
  behavioralChange: string;
  coachingEffectiveness: string;
  progressTracking: string;
  motivationLevel: string;
  developmentPlan: string;

  // Clinical Analysis
  therapeuticAlliance: string;
  mentalHealthIndicators: string;
  copingMechanisms: string;
  interventionEffectiveness: string;
  riskAssessment: string;
  treatmentProgress: string;

  // AI & Configuration
  aiConfiguration: string;
  templateManagement: string;
  apiKey: string;
  provider: string;
  model: string;
  saveSettings: string;
  settingsSaved: string;
  noApiKey: string;
  analysisError: string;

  // Coach
  coachTitle: string;
  coachPlaceholder: string;

  // File & Data
  fileName: string;
  fileSize: string;
  fileSizeKB: string;
  analysisDate: string;
  duration: string;

  // Status Messages
  analysisComplete: string;
  analysisFailed: string;
  saveSuccess: string;
  deleteSuccess: string;

  // Disclaimers
  clinicalDisclaimer: string;
  observationalOnly: string;
  notDiagnostic: string;
  professionalAdvice: string;

  // Chart and Data Elements
  chartDataIncomplete: string;
  chartDataDetected: string;
  availableFields: string;
  dataPointsCount: string;
  moreItems: string;

  // Response Timing Elements
  responseTimingPatterns: string;
  timingAnalysis: string;
  responseSpeed: string;
  communicationRhythm: string;
  interactionFlow: string;

  // Emotional Intelligence Components
  emotionalIntelligenceComponents: string;
  selfAwareness: string;
  empathy: string;
  emotionalRegulation: string;
  socialSkills: string;

  // Measurement Units
  scoreUnit: string;
  percentageUnit: string;
  levelUnit: string;
  ratingUnit: string;
  effectivenessUnit: string;
  intensityUnit: string;

  // Common Interaction Elements
  showMore: string;
  showLess: string;
  expand: string;
  collapse: string;
  refresh: string;
  retry: string;
  filter: string;
  sort: string;
  search: string;
  reset: string;
  apply: string;

  // Advanced Analysis Elements
  advancedAnalysis: string;
  detailedBreakdown: string;
  comprehensiveView: string;
  quickSummary: string;
  keyHighlights: string;

  // Status and Progress
  analysisInProgress: string;
  analysisCompleted: string;
  processingData: string;
  generatingInsights: string;
  complete: string;
  inProgress: string;
  pending: string;
  failed: string;
  processing: string;

  // Chart Types
  lineChart: string;
  barChart: string;
  scoreDisplay: string;
  progressIndicator: string;

  // Navigation
  backToMain: string;
  goToHistory: string;
  openSettings: string;
  viewDetails: string;

  // File Handling
  uploadFile: string;
  fileUploaded: string;
  selectFile: string;
  dragDropFile: string;

  // Background Processing
  backgroundAnalysis: string;
  backgroundAnalysisCompleted: string;
  recentJobs: string;
  noRecentJobs: string;
  comingSoon: string;

  // Export and Sharing
  exportData: string;
  shareResults: string;
  downloadReport: string;
  generatePDF: string;
  copyLink: string;

  // Accessibility
  accessibilityFeatures: string;
  screenReaderSupport: string;
  keyboardNavigation: string;
  highContrast: string;
  largeText: string;
}

// Enhanced translation data with comprehensive Arabic translations
const enhancedTranslations: Record<SupportedLanguage, EnhancedTranslations> = {
  en: {
    // Core App
    appTitle: "CharismaAI",
    appDescription:
      "Upload your chat conversation to discover sophisticated insights about communication patterns, psychological dynamics, and behavioral analysis using advanced AI frameworks.",

    // Navigation & UI
    settings: "Settings",
    history: "History",
    analyzeConversation: "Analyze Conversation",
    analyzing: "Analyzing...",
    selectChatFile: "Select Chat File",
    upload: "Upload",
    close: "Close",
    loading: "Loading",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",

    // Analysis Views
    overview: "Overview",
    insights: "Insights",
    categories: "Categories",
    metrics: "Metrics",
    templateInsights: "Template Insights",
    detailedAnalysis: "Detailed Analysis",

    // Core Analysis Elements
    personality: "Personality",
    emotionalArc: "Emotional Arc",
    topics: "Topics",
    communicationPatterns: "Communication Patterns",
    overallSummary: "Overall Summary",
    detectedLanguage: "Detected Language",

    // Enhanced Insight Categories
    psychologyInsights: "Psychology",
    psychologyDescription:
      "Deep psychological analysis including personality traits, behavioral patterns, and mental models",
    relationshipInsights: "Relationship",
    relationshipDescription:
      "Relationship dynamics, emotional bonds, and interpersonal connections",
    communicationInsights: "Communication",
    communicationDescription:
      "Communication effectiveness, patterns, and interpersonal skills",
    emotionalInsights: "Emotional",
    emotionalDescription:
      "Emotional intelligence, regulation, and emotional awareness",
    leadershipInsights: "Leadership",
    leadershipDescription:
      "Leadership competencies, team dynamics, and executive presence",
    businessInsights: "Business",
    businessDescription:
      "Professional communication, business effectiveness, and organizational dynamics",
    coachingInsights: "Coaching",
    coachingDescription:
      "Development progress, goal achievement, and coaching effectiveness",
    clinicalInsights: "Clinical",
    clinicalDescription:
      "Therapeutic relationships, mental health indicators, and clinical observations",
    dataInsights: "Data Analytics",
    dataDescription: "Quantitative analysis, metrics, and data-driven insights",
    subtextInsights: "Subtext",
    subtextDescription:
      "Hidden meanings, implicit messages, and underlying intentions",
    predictiveInsights: "Predictive",
    predictiveDescription:
      "Future trajectory, potential outcomes, and strategic forecasting",
    generalInsights: "General",
    generalDescription: "General observations and miscellaneous insights",

    // Analysis Metrics & Stats
    totalInsights: "Total Insights",
    highPriority: "High Priority",
    keyMetrics: "Key Metrics",
    topPriorityInsights: "Top Priority Insights",
    mostImportantFindings: "Most important findings from the analysis",
    confidenceScore: "Confidence Score",
    priorityLevel: "Priority Level",

    // Filtering & Display
    filterBy: "Filter by",
    all: "All",
    viewInsights: "View Insights",
    noInsightsFound: "No insights found for the selected category.",

    // Priority Levels
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",

    // Chart & Visualization
    chartTitle: "Chart",
    dataPoints: "Data Points",
    xAxis: "X Axis",
    yAxis: "Y Axis",
    intensity: "Intensity",
    relevance: "Relevance",
    effectiveness: "Effectiveness",
    score: "Score",
    percentage: "Percentage",

    // Forensic Analysis Specific
    maskAnalysis: "Mask Analysis",
    shadowAnalysis: "Shadow Analysis",
    coreDesireFear: "Core Desire & Fear",
    attachmentStyle: "Attachment Style",
    powerDynamics: "Power Dynamics",
    subtextDecoder: "Subtext Decoder",
    predictiveForecast: "Predictive Forecast",
    relationshipTrajectory: "Relationship Trajectory",
    psychologicalProfile: "Psychological Profile",

    // Communication Analysis
    emotionalIntelligence: "Emotional Intelligence",
    activeListening: "Active Listening",
    persuasionTechniques: "Persuasion Techniques",
    communicationBarriers: "Communication Barriers",
    rapportBuilding: "Rapport Building",
    empathyLevel: "Empathy Level",
    clarityScore: "Clarity Score",

    // Relationship Analysis
    intimacyDimensions: "Intimacy Dimensions",
    conflictResolution: "Conflict Resolution",
    loveLanguages: "Love Languages",
    trustLevel: "Trust Level",
    emotionalSupport: "Emotional Support",
    relationshipHealth: "Relationship Health",

    // Business Analysis
    leadershipCompetencies: "Leadership Competencies",
    teamDynamics: "Team Dynamics",
    meetingEffectiveness: "Meeting Effectiveness",
    decisionMaking: "Decision Making",
    strategicThinking: "Strategic Thinking",
    psychologicalSafety: "Psychological Safety",

    // Coaching Analysis
    goalAchievement: "Goal Achievement",
    behavioralChange: "Behavioral Change",
    coachingEffectiveness: "Coaching Effectiveness",
    progressTracking: "Progress Tracking",
    motivationLevel: "Motivation Level",
    developmentPlan: "Development Plan",

    // Clinical Analysis
    therapeuticAlliance: "Therapeutic Alliance",
    mentalHealthIndicators: "Mental Health Indicators",
    copingMechanisms: "Coping Mechanisms",
    interventionEffectiveness: "Intervention Effectiveness",
    riskAssessment: "Risk Assessment",
    treatmentProgress: "Treatment Progress",

    // AI & Configuration
    aiConfiguration: "AI Configuration",
    templateManagement: "Template Management",
    apiKey: "API Key",
    provider: "Provider",
    model: "Model",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully!",
    noApiKey: "No API key configured. Please add your API key in Settings.",
    analysisError:
      "Failed to analyze conversation. Please check your settings and try again.",

    // Coach
    coachTitle: "AI Coach",
    coachPlaceholder: "Ask about the conversation analysis...",

    // File & Data
    fileName: "File Name",
    fileSize: "File Size",
    fileSizeKB: "KB",
    analysisDate: "Analysis Date",
    duration: "Duration",

    // Status Messages
    analysisComplete: "Analysis completed successfully",
    analysisFailed: "Analysis failed",
    saveSuccess: "Saved successfully",
    deleteSuccess: "Deleted successfully",

    // Disclaimers
    clinicalDisclaimer: "Clinical Disclaimer",
    observationalOnly: "Observational analysis only",
    notDiagnostic: "Not for diagnostic purposes",
    professionalAdvice: "Consult a professional for medical advice",

    // Chart and Data Elements
    chartDataIncomplete: "Chart data incomplete",
    chartDataDetected: "Chart data detected",
    availableFields: "Available fields",
    dataPointsCount: "Data points",
    moreItems: "More items",

    // Response Timing Elements
    responseTimingPatterns: "Response timing patterns",
    timingAnalysis: "Timing analysis",
    responseSpeed: "Response speed",
    communicationRhythm: "Communication rhythm",
    interactionFlow: "Interaction flow",

    // Emotional Intelligence Components
    emotionalIntelligenceComponents: "Emotional intelligence components",
    selfAwareness: "Self-awareness",
    empathy: "Empathy",
    emotionalRegulation: "Emotional regulation",
    socialSkills: "Social skills",

    // Measurement Units
    scoreUnit: "Score",
    percentageUnit: "%",
    levelUnit: "Level",
    ratingUnit: "Rating",
    effectivenessUnit: "Effectiveness",
    intensityUnit: "Intensity",

    // Common Interaction Elements
    showMore: "Show more",
    showLess: "Show less",
    expand: "Expand",
    collapse: "Collapse",
    filter: "Filter",
    sort: "Sort",
    search: "Search",
    reset: "Reset",
    apply: "Apply",

    // Advanced Analysis Elements
    advancedAnalysis: "Advanced analysis",
    detailedBreakdown: "Detailed breakdown",
    comprehensiveView: "Comprehensive view",
    quickSummary: "Quick summary",
    keyHighlights: "Key highlights",

    // Status and Progress
    complete: "Complete",
    inProgress: "In progress",
    pending: "Pending",
    failed: "Failed",
    processing: "Processing",

    // Export and Sharing
    exportData: "Export data",
    shareResults: "Share results",
    downloadReport: "Download report",
    generatePDF: "Generate PDF",
    copyLink: "Copy link",

    // Accessibility
    accessibilityFeatures: "Accessibility features",
    screenReaderSupport: "Screen reader support",
    keyboardNavigation: "Keyboard navigation",
    highContrast: "High contrast",
    largeText: "Large text",

    // Missing fields
    refresh: "Refresh",
    retry: "Retry",
    analysisInProgress: "Analysis in progress",
    analysisCompleted: "Analysis completed",
    processingData: "Processing data",
    generatingInsights: "Generating insights",
    lineChart: "Line chart",
    barChart: "Bar chart",
    scoreDisplay: "Score display",
    progressIndicator: "Progress indicator",
    backToMain: "Back to main",
    goToHistory: "Go to history",
    openSettings: "Open settings",
    viewDetails: "View details",
    uploadFile: "Upload file",
    fileUploaded: "File uploaded",
    selectFile: "Select file",
    dragDropFile: "Drag and drop file",

    // Background Processing
    backgroundAnalysis: "Background Analysis",
    backgroundAnalysisCompleted:
      "Analysis completed successfully! Check your history to view results.",
    recentJobs: "Recent Jobs",
    noRecentJobs: "No recent analysis jobs found.",
    comingSoon: "Coming Soon",
  },

  ar: {
    // Core App
    appTitle: "CharismaAI",
    appDescription:
      "ارفع محادثتك لاكتشاف رؤى متطورة حول أنماط التواصل والديناميكيات النفسية والتحليل السلوكي باستخدام أطر الذكاء الاصطناعي المتقدمة.",

    // Navigation & UI
    settings: "الإعدادات",
    history: "السجل",
    analyzeConversation: "تحليل المحادثة",
    analyzing: "جاري التحليل...",
    selectChatFile: "اختر ملف المحادثة",
    upload: "رفع",
    close: "إغلاق",
    loading: "تحميل",
    error: "خطأ",
    success: "نجح",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تحرير",
    view: "عرض",

    // Analysis Views
    overview: "نظرة عامة",
    insights: "الرؤى",
    categories: "الفئات",
    metrics: "المقاييس",
    templateInsights: "رؤى القالب",
    detailedAnalysis: "تحليل مفصل",

    // Core Analysis Elements
    personality: "الشخصية",
    emotionalArc: "القوس العاطفي",
    topics: "المواضيع",
    communicationPatterns: "أنماط التواصل",
    overallSummary: "الملخص العام",
    detectedLanguage: "اللغة المكتشفة",

    // Enhanced Insight Categories
    psychologyInsights: "علم النفس",
    psychologyDescription:
      "تحليل نفسي عميق يشمل سمات الشخصية والأنماط السلوكية والنماذج العقلية",
    relationshipInsights: "العلاقات",
    relationshipDescription:
      "ديناميكيات العلاقات والروابط العاطفية والصلات الشخصية",
    communicationInsights: "التواصل",
    communicationDescription: "فعالية التواصل والأنماط والمهارات الشخصية",
    emotionalInsights: "العاطفي",
    emotionalDescription: "الذكاء العاطفي والتنظيم والوعي العاطفي",
    leadershipInsights: "القيادة",
    leadershipDescription: "كفاءات القيادة وديناميكيات الفريق والحضور التنفيذي",
    businessInsights: "الأعمال",
    businessDescription:
      "التواصل المهني وفعالية الأعمال والديناميكيات التنظيمية",
    coachingInsights: "التدريب",
    coachingDescription: "تقدم التطوير وتحقيق الأهداف وفعالية التدريب",
    clinicalInsights: "الإكلينيكي",
    clinicalDescription:
      "العلاقات العلاجية ومؤشرات الصحة النفسية والملاحظات الإكلينيكية",
    dataInsights: "تحليل البيانات",
    dataDescription: "التحليل الكمي والمقاييس والرؤى المدفوعة بالبيانات",
    subtextInsights: "النص الضمني",
    subtextDescription: "المعاني الخفية والرسائل الضمنية والنوايا الكامنة",
    predictiveInsights: "التنبؤي",
    predictiveDescription:
      "المسار المستقبلي والنتائج المحتملة والتنبؤ الاستراتيجي",
    generalInsights: "عام",
    generalDescription: "ملاحظات عامة ورؤى متنوعة",

    // Analysis Metrics & Stats
    totalInsights: "إجمالي الرؤى",
    highPriority: "أولوية عالية",
    keyMetrics: "المقاييس الرئيسية",
    topPriorityInsights: "الرؤى ذات الأولوية العليا",
    mostImportantFindings: "أهم النتائج من التحليل",
    confidenceScore: "درجة الثقة",
    priorityLevel: "مستوى الأولوية",

    // Filtering & Display
    filterBy: "تصفية حسب",
    all: "الكل",
    viewInsights: "عرض الرؤى",
    noInsightsFound: "لم يتم العثور على رؤى للفئة المحددة.",

    // Priority Levels
    critical: "حرج",
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
    info: "معلومات",

    // Chart & Visualization
    chartTitle: "الرسم البياني",
    dataPoints: "نقاط البيانات",
    xAxis: "المحور السيني",
    yAxis: "المحور الصادي",
    intensity: "الشدة",
    relevance: "الصلة",
    effectiveness: "الفعالية",
    score: "النتيجة",
    percentage: "النسبة المئوية",

    // Forensic Analysis Specific
    maskAnalysis: "تحليل القناع",
    shadowAnalysis: "تحليل الظل",
    coreDesireFear: "الرغبة والخوف الجوهري",
    attachmentStyle: "نمط التعلق",
    powerDynamics: "ديناميكيات القوة",
    subtextDecoder: "فاكك النص الضمني",
    predictiveForecast: "التنبؤ المستقبلي",
    relationshipTrajectory: "مسار العلاقة",
    psychologicalProfile: "الملف النفسي",

    // Communication Analysis
    emotionalIntelligence: "الذكاء العاطفي",
    activeListening: "الاستماع الفعال",
    persuasionTechniques: "تقنيات الإقناع",
    communicationBarriers: "حواجز التواصل",
    rapportBuilding: "بناء الألفة",
    empathyLevel: "مستوى التعاطف",
    clarityScore: "درجة الوضوح",

    // Relationship Analysis
    intimacyDimensions: "أبعاد الحميمية",
    conflictResolution: "حل النزاعات",
    loveLanguages: "لغات الحب",
    trustLevel: "مستوى الثقة",
    emotionalSupport: "الدعم العاطفي",
    relationshipHealth: "صحة العلاقة",

    // Business Analysis
    leadershipCompetencies: "كفاءات القيادة",
    teamDynamics: "ديناميكيات الفريق",
    meetingEffectiveness: "فعالية الاجتماعات",
    decisionMaking: "صنع القرار",
    strategicThinking: "التفكير الاستراتيجي",
    psychologicalSafety: "الأمان النفسي",

    // Coaching Analysis
    goalAchievement: "تحقيق الأهداف",
    behavioralChange: "التغيير السلوكي",
    coachingEffectiveness: "فعالية التدريب",
    progressTracking: "تتبع التقدم",
    motivationLevel: "مستوى الدافعية",
    developmentPlan: "خطة التطوير",

    // Clinical Analysis
    therapeuticAlliance: "التحالف العلاجي",
    mentalHealthIndicators: "مؤشرات الصحة النفسية",
    copingMechanisms: "آليات التكيف",
    interventionEffectiveness: "فعالية التدخل",
    riskAssessment: "تقييم المخاطر",
    treatmentProgress: "تقدم العلاج",

    // AI & Configuration
    aiConfiguration: "إعداد الذكاء الاصطناعي",
    templateManagement: "إدارة القوالب",
    apiKey: "مفتاح API",
    provider: "المزود",
    model: "النموذج",
    saveSettings: "حفظ الإعدادات",
    settingsSaved: "تم حفظ الإعدادات بنجاح!",
    noApiKey: "لم يتم تكوين مفتاح API. يرجى إضافة مفتاح API في الإعدادات.",
    analysisError:
      "فشل في تحليل المحادثة. يرجى التحقق من إعداداتك والمحاولة مرة أخرى.",

    // Coach
    coachTitle: "المدرب الذكي",
    coachPlaceholder: "اسأل عن تحليل المحادثة...",

    // File & Data
    fileName: "اسم الملف",
    fileSize: "حجم الملف",
    fileSizeKB: "كيلوبايت",
    analysisDate: "تاريخ التحليل",
    duration: "المدة",

    // Status Messages
    analysisComplete: "تم إكمال التحليل بنجاح",
    analysisFailed: "فشل التحليل",
    saveSuccess: "تم الحفظ بنجاح",
    deleteSuccess: "تم الحذف بنجاح",

    // Disclaimers
    clinicalDisclaimer: "إخلاء مسؤولية إكلينيكية",
    observationalOnly: "تحليل ملاحظاتي فقط",
    notDiagnostic: "ليس لأغراض التشخيص",
    professionalAdvice: "استشر مختصًا للمشورة الطبية",

    // Chart and Data Elements
    chartDataIncomplete: "بيانات الرسم البياني غير مكتملة",
    chartDataDetected: "تم اكتشاف بيانات الرسم البياني",
    availableFields: "الحقول المتاحة",
    dataPointsCount: "نقاط البيانات",
    moreItems: "عناصر أكثر",

    // Response Timing Elements
    responseTimingPatterns: "أنماط توقيت الاستجابة",
    timingAnalysis: "تحليل التوقيت",
    responseSpeed: "سرعة الاستجابة",
    communicationRhythm: "إيقاع التواصل",
    interactionFlow: "تدفق التفاعل",

    // Emotional Intelligence Components
    emotionalIntelligenceComponents: "مكونات الذكاء العاطفي",
    selfAwareness: "الوعي الذاتي",
    empathy: "التعاطف",
    emotionalRegulation: "تنظيم العواطف",
    socialSkills: "المهارات الاجتماعية",

    // Measurement Units
    scoreUnit: "النتيجة",
    percentageUnit: "%",
    levelUnit: "المستوى",
    ratingUnit: "التقييم",
    effectivenessUnit: "الفعالية",
    intensityUnit: "الشدة",

    // Common Interaction Elements
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    expand: "توسيع",
    collapse: "طي",
    filter: "تصفية",
    sort: "ترتيب",
    search: "بحث",
    reset: "إعادة تعيين",
    apply: "تطبيق",

    // Advanced Analysis Elements
    advancedAnalysis: "تحليل متقدم",
    detailedBreakdown: "تفصيل مفصل",
    comprehensiveView: "عرض شامل",
    quickSummary: "ملخص سريع",
    keyHighlights: "النقاط البارزة",

    // Status and Progress
    complete: "مكتمل",
    inProgress: "قيد التقدم",
    pending: "في الانتظار",
    failed: "فشل",
    processing: "معالجة",

    // Export and Sharing
    exportData: "تصدير البيانات",
    shareResults: "مشاركة النتائج",
    downloadReport: "تنزيل التقرير",
    generatePDF: "إنشاء PDF",
    copyLink: "نسخ الرابط",

    // Accessibility
    accessibilityFeatures: "ميزات إمكانية الوصول",
    screenReaderSupport: "دعم قارئ الشاشة",
    keyboardNavigation: "التنقل بلوحة المفاتيح",
    highContrast: "تباين عالي",
    largeText: "نص كبير",

    // Missing fields
    refresh: "تحديث",
    retry: "إعادة المحاولة",
    analysisInProgress: "التحليل قيد التقدم",
    analysisCompleted: "تم إكمال التحليل",
    processingData: "معالجة البيانات",
    generatingInsights: "توليد الرؤى",
    lineChart: "رسم بياني خطي",
    barChart: "رسم بياني عمودي",
    scoreDisplay: "عرض النتيجة",
    progressIndicator: "مؤشر التقدم",
    backToMain: "العودة للرئيسية",
    goToHistory: "الذهاب للسجل",
    openSettings: "فتح الإعدادات",
    viewDetails: "عرض التفاصيل",
    uploadFile: "رفع ملف",
    fileUploaded: "تم رفع الملف",
    selectFile: "اختيار ملف",
    dragDropFile: "سحب وإفلات الملف",

    // Background Processing
    backgroundAnalysis: "التحليل في الخلفية",
    backgroundAnalysisCompleted:
      "تم إكمال التحليل بنجاح! تحقق من سجلك لعرض النتائج.",
    recentJobs: "الوظائف الحديثة",
    noRecentJobs: "لم يتم العثور على وظائف تحليل حديثة.",
    comingSoon: "قريباً",
  },
};

// Get enhanced translations for a specific language
export function getEnhancedTranslations(
  language: SupportedLanguage,
): EnhancedTranslations {
  return enhancedTranslations[language] || enhancedTranslations.en;
}

// Get translation with fallback
export function et(
  key: keyof EnhancedTranslations,
  language: SupportedLanguage,
): string {
  const trans = getEnhancedTranslations(language);
  return trans[key] || enhancedTranslations.en[key];
}

// Check if language is RTL (Right-to-Left)
export function isRTL(language: SupportedLanguage): boolean {
  return ["ar"].includes(language);
}

// Get language direction
export function getLanguageDirection(
  language: SupportedLanguage,
): "ltr" | "rtl" {
  return isRTL(language) ? "rtl" : "ltr";
}

// Enhanced language context for React components
export interface EnhancedLanguageContextType {
  language: SupportedLanguage;
  translations: EnhancedTranslations;
  isRTL: boolean;
  direction: "ltr" | "rtl";
  setLanguage: (lang: SupportedLanguage) => void;
}

// RTL-aware CSS classes helper
export function getRTLClasses(isRTL: boolean) {
  return {
    textAlign: isRTL ? "text-right" : "text-left",
    marginLeft: isRTL ? "mr" : "ml",
    marginRight: isRTL ? "ml" : "mr",
    paddingLeft: isRTL ? "pr" : "pl",
    paddingRight: isRTL ? "pl" : "pr",
    borderLeft: isRTL ? "border-r" : "border-l",
    borderRight: isRTL ? "border-l" : "border-r",
    roundedLeft: isRTL ? "rounded-r" : "rounded-l",
    roundedRight: isRTL ? "rounded-l" : "rounded-r",
  };
}

// Number formatting for Arabic
export function formatNumber(num: number, language: SupportedLanguage): string {
  if (language === "ar") {
    // Convert Western Arabic numerals to Eastern Arabic numerals
    return num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  }
  return num.toString();
}

// Date formatting for Arabic
export function formatDate(date: Date, language: SupportedLanguage): string {
  if (language === "ar") {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
