// Comprehensive Internationalization for CharismaAI with full project coverage
export type SupportedLanguage = "en" | "ar";

// Language detection from analysis results with better accuracy
export function detectLanguageCode(detectedLanguage: string): SupportedLanguage {
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

// Comprehensive translation interface covering the entire project
export interface ComprehensiveTranslations {
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
  
  // Chart and Data Elements
  chartDataIncomplete: string;
  chartDataDetected: string;
  availableFields: string;
  dataPointsCount: string;
  moreItems: string;
  
  // Response Timing Elements (specific to the missing chart fix)
  responseTimingPatterns: string;
  timingAnalysis: string;
  responseSpeed: string;
  communicationRhythm: string;
  interactionFlow: string;
  
  // Emotional Intelligence Components (specific to the missing chart fix)
  emotionalIntelligenceComponents: string;
  selfAwareness: string;
  empathy: string;
  emotionalRegulation: string;
  socialSkills: string;
  
  // Measurement Units (updated for 1-100 scale)
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
  
  // Analysis Status
  analysisInProgress: string;
  analysisCompleted: string;
  processingData: string;
  generatingInsights: string;
  
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
  
  // Language System
  language: string;
  changeLanguage: string;
  currentLanguage: string;
  supportedLanguages: string;
  rtlSupport: string;
  languageDetection: string;
}

// Enhanced translation data with comprehensive Arabic translations
const comprehensiveTranslations: Record<SupportedLanguage, ComprehensiveTranslations> = {
  en: {
    // Core App
    appTitle: "CharismaAI",
    appDescription: "Upload your chat conversation to discover sophisticated insights about communication patterns, psychological dynamics, and behavioral analysis using advanced AI frameworks.",
    
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
    psychologyDescription: "Deep psychological analysis including personality traits, behavioral patterns, and mental models",
    relationshipInsights: "Relationship",
    relationshipDescription: "Relationship dynamics, emotional bonds, and interpersonal connections",
    communicationInsights: "Communication",
    communicationDescription: "Communication effectiveness, patterns, and interpersonal skills",
    emotionalInsights: "Emotional",
    emotionalDescription: "Emotional intelligence, regulation, and emotional awareness",
    leadershipInsights: "Leadership",
    leadershipDescription: "Leadership competencies, team dynamics, and executive presence",
    businessInsights: "Business",
    businessDescription: "Professional communication, business effectiveness, and organizational dynamics",
    coachingInsights: "Coaching",
    coachingDescription: "Development progress, goal achievement, and coaching effectiveness",
    clinicalInsights: "Clinical",
    clinicalDescription: "Therapeutic relationships, mental health indicators, and clinical observations",
    dataInsights: "Data Analytics",
    dataDescription: "Quantitative analysis, metrics, and data-driven insights",
    subtextInsights: "Subtext",
    subtextDescription: "Hidden meanings, implicit messages, and underlying intentions",
    predictiveInsights: "Predictive",
    predictiveDescription: "Future trajectory, potential outcomes, and strategic forecasting",
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
    
    // Chart and Data Elements
    chartDataIncomplete: "Chart data available but metadata incomplete. Please check AI template configuration.",
    chartDataDetected: "Chart data detected - attempting automatic rendering...",
    availableFields: "Available fields",
    dataPointsCount: "Data points",
    moreItems: "more items",
    
    // Response Timing Elements
    responseTimingPatterns: "Response Timing Patterns",
    timingAnalysis: "Timing Analysis",
    responseSpeed: "Response Speed",
    communicationRhythm: "Communication Rhythm",
    interactionFlow: "Interaction Flow",
    
    // Emotional Intelligence Components
    emotionalIntelligenceComponents: "Emotional Intelligence Components",
    selfAwareness: "Self-Awareness",
    empathy: "Empathy",
    emotionalRegulation: "Emotional Regulation",
    socialSkills: "Social Skills",
    
    // Measurement Units (updated for 1-100 scale)
    scoreUnit: "Score (1-100)",
    percentageUnit: "Percentage (%)",
    levelUnit: "Level (1-100)",
    ratingUnit: "Rating (1-100)",
    effectivenessUnit: "Effectiveness (1-100)",
    intensityUnit: "Intensity (1-100)",
    
    // Common Interaction Elements
    showMore: "Show More",
    showLess: "Show Less",
    expand: "Expand",
    collapse: "Collapse",
    refresh: "Refresh",
    retry: "Retry",
    
    // Analysis Status
    analysisInProgress: "Analysis in progress...",
    analysisCompleted: "Analysis completed",
    processingData: "Processing data...",
    generatingInsights: "Generating insights...",
    
    // Chart Types
    lineChart: "Line Chart",
    barChart: "Bar Chart",
    scoreDisplay: "Score Display",
    progressIndicator: "Progress Indicator",
    
    // Navigation
    backToMain: "Back to Main",
    goToHistory: "Go to History",
    openSettings: "Open Settings",
    viewDetails: "View Details",
    
    // File Handling
    uploadFile: "Upload File",
    fileUploaded: "File Uploaded",
    selectFile: "Select File",
    dragDropFile: "Drag and drop file here",
    
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
    analysisError: "Failed to analyze conversation. Please check your settings and try again.",
    
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
    
    // Language System
    language: "Language",
    changeLanguage: "Change Language",
    currentLanguage: "Current Language",
    supportedLanguages: "Supported Languages",
    rtlSupport: "RTL Support",
    languageDetection: "Language Detection",
  },

  ar: {
    // Core App
    appTitle: "CharismaAI",
    appDescription: "ارفع محادثتك لاكتشاف رؤى متطورة حول أنماط التواصل والديناميكيات النفسية والتحليل السلوكي باستخدام أطر الذكاء الاصطناعي المتقدمة.",
    
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
    psychologyDescription: "تحليل نفسي عميق يشمل سمات الشخصية والأنماط السلوكية والنماذج العقلية",
    relationshipInsights: "العلاقات",
    relationshipDescription: "ديناميكيات العلاقات والروابط العاطفية والصلات الشخصية",
    communicationInsights: "التواصل",
    communicationDescription: "فعالية التواصل والأنماط والمهارات الشخصية",
    emotionalInsights: "العاطفي",
    emotionalDescription: "الذكاء العاطفي والتنظيم والوعي العاطفي",
    leadershipInsights: "القيادة",
    leadershipDescription: "كفاءات القيادة وديناميكيات الفريق والحضور التنفيذي",
    businessInsights: "الأعمال",
    businessDescription: "التواصل المهني وفعالية الأعمال والديناميكيات التنظيمية",
    coachingInsights: "التدريب",
    coachingDescription: "تقدم التطوير وتحقيق الأهداف وفعالية التدريب",
    clinicalInsights: "الإكلينيكي",
    clinicalDescription: "العلاقات العلاجية ومؤشرات الصحة النفسية والملاحظات الإكلينيكية",
    dataInsights: "تحليل البيانات",
    dataDescription: "التحليل الكمي والمقاييس والرؤى المدفوعة بالبيانات",
    subtextInsights: "النص الضمني",
    subtextDescription: "المعاني الخفية والرسائل الضمنية والنوايا الكامنة",
    predictiveInsights: "التنبؤي",
    predictiveDescription: "المسار المستقبلي والنتائج المحتملة والتنبؤ الاستراتيجي",
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
    
    // Chart and Data Elements
    chartDataIncomplete: "بيانات الرسم البياني متاحة لكن البيانات الوصفية غير مكتملة. يرجى التحقق من إعداد قالب الذكاء الاصطناعي.",
    chartDataDetected: "تم اكتشاف بيانات الرسم البياني - جاري محاولة العرض التلقائي...",
    availableFields: "الحقول المتاحة",
    dataPointsCount: "نقاط البيانات",
    moreItems: "عناصر أخرى",
    
    // Response Timing Elements (specific translations for the missing chart)
    responseTimingPatterns: "أنماط توقيت الاستجابة",
    timingAnalysis: "تحليل التوقيت",
    responseSpeed: "سرعة الاستجابة",
    communicationRhythm: "إيقاع التواصل",
    interactionFlow: "تدفق التفاعل",
    
    // Emotional Intelligence Components (specific translations for the missing chart)
    emotionalIntelligenceComponents: "مكونات الذكاء العاطفي",
    selfAwareness: "الوعي الذاتي",
    empathy: "التعاطف",
    emotionalRegulation: "تنظيم المشاعر",
    socialSkills: "المهارات الاجتماعية",
    
    // Measurement Units (updated for 1-100 scale)
    scoreUnit: "النتيجة (١-١٠٠)",
    percentageUnit: "النسبة المئوية (%)",
    levelUnit: "المستوى (١-١٠٠)",
    ratingUnit: "التقييم (١-١٠٠)",
    effectivenessUnit: "الفعالية (١-١٠٠)",
    intensityUnit: "الشدة (١-١٠٠)",
    
    // Common Interaction Elements
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    expand: "توسيع",
    collapse: "طي",
    refresh: "تحديث",
    retry: "إعادة المحاولة",
    
    // Analysis Status
    analysisInProgress: "التحليل قيد التقدم...",
    analysisCompleted: "تم إكمال التحليل",
    processingData: "معالجة البيانات...",
    generatingInsights: "توليد الرؤى...",
    
    // Chart Types
    lineChart: "الرسم البياني الخطي",
    barChart: "الرسم البياني العمودي",
    scoreDisplay: "عرض النتيجة",
    progressIndicator: "مؤشر التقدم",
    
    // Navigation
    backToMain: "العودة للرئيسية",
    goToHistory: "الذهاب للسجل",
    openSettings: "فتح الإعدادات",
    viewDetails: "عرض التفاصيل",
    
    // File Handling
    uploadFile: "رفع ملف",
    fileUploaded: "تم رفع الملف",
    selectFile: "اختر ملف",
    dragDropFile: "اسحب وأفلت الملف هنا",
    
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
    analysisError: "فشل في تحليل المحادثة. يرجى التحقق من إعداداتك والمحاولة مرة أخرى.",
    
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
    
    // Language System
    language: "اللغة",
    changeLanguage: "تغيير اللغة",
    currentLanguage: "اللغة الحالية",
    supportedLanguages: "اللغات المدعومة",
    rtlSupport: "دعم RTL",
    languageDetection: "اكتشاف اللغة",
  },
};

// Get comprehensive translations for a specific language
export function getComprehensiveTranslations(language: SupportedLanguage): ComprehensiveTranslations {
  return comprehensiveTranslations[language] || comprehensiveTranslations.en;
}

// Get translation with fallback
export function ct(key: keyof ComprehensiveTranslations, language: SupportedLanguage): string {
  const trans = getComprehensiveTranslations(language);
  return trans[key] || comprehensiveTranslations.en[key];
}

// Check if language is RTL (Right-to-Left)
export function isRTL(language: SupportedLanguage): boolean {
  return ["ar"].includes(language);
}

// Get language direction
export function getLanguageDirection(language: SupportedLanguage): "ltr" | "rtl" {
  return isRTL(language) ? "rtl" : "ltr";
}

// Enhanced language context for React components
export interface ComprehensiveLanguageContextType {
  language: SupportedLanguage;
  translations: ComprehensiveTranslations;
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

// Number formatting for Arabic (Eastern Arabic numerals)
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