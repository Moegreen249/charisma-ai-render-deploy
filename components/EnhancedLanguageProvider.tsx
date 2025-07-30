"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  SupportedLanguage,
  ComprehensiveLanguageContextType,
  detectLanguageCode,
  getComprehensiveTranslations,
  isRTL,
  getLanguageDirection,
  getRTLClasses,
} from "@/lib/comprehensive-translations";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface EnhancedLanguageProviderProps {
  children: ReactNode;
  detectedLanguage?: string;
}

// Create enhanced language context
const EnhancedLanguageContext = createContext<ComprehensiveLanguageContextType | undefined>(undefined);

export function EnhancedLanguageProvider({
  children,
  detectedLanguage,
}: EnhancedLanguageProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage or detected language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("charisma-language") as SupportedLanguage;
    
    if (savedLanguage && ["en", "ar"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else if (detectedLanguage) {
      const detected = detectLanguageCode(detectedLanguage);
      setLanguage(detected);
      localStorage.setItem("charisma-language", detected);
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes("ar")) {
        setLanguage("ar");
        localStorage.setItem("charisma-language", "ar");
      }
    }
    
    setIsInitialized(true);
  }, [detectedLanguage]);

  // Update document direction, language attributes, and fonts
  useEffect(() => {
    if (isInitialized) {
      const direction = getLanguageDirection(language);
      const html = document.documentElement;
      const body = document.body;
      
      html.setAttribute("dir", direction);
      html.setAttribute("lang", language === "ar" ? "ar-SA" : "en-US");
      
      // Add CSS class for RTL styling
      if (language === "ar") {
        html.classList.add("rtl");
        body.classList.add("font-arabic");
        body.classList.remove("font-english");
      } else {
        html.classList.remove("rtl");
        body.classList.add("font-english");
        body.classList.remove("font-arabic");
      }
    }
  }, [language, isInitialized]);

  const handleSetLanguage = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("charisma-language", newLanguage);
  };

  const contextValue: ComprehensiveLanguageContextType = {
    language,
    translations: getComprehensiveTranslations(language),
    isRTL: isRTL(language),
    direction: getLanguageDirection(language),
    setLanguage: handleSetLanguage,
  };

  // Don't render until initialized to prevent hydration mismatches
  if (!isInitialized) {
    return null;
  }

  return (
    <EnhancedLanguageContext.Provider value={contextValue}>
      {children}
    </EnhancedLanguageContext.Provider>
  );
}

// Enhanced language hook
export function useEnhancedLanguage(): ComprehensiveLanguageContextType {
  const context = useContext(EnhancedLanguageContext);
  if (context === undefined) {
    throw new Error("useEnhancedLanguage must be used within an EnhancedLanguageProvider");
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage, translations: t, isRTL } = useEnhancedLanguage();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌐 {t.language}
        </CardTitle>
        <CardDescription>
          {isRTL ? 
            "اختر لغتك المفضلة وإعدادات العرض" : 
            "Choose your preferred language and display settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t.currentLanguage}
          </label>
          <Select value={language} onValueChange={(value) => setLanguage(value as SupportedLanguage)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇺🇸</span>
                  <div>
                    <div className="font-medium">English</div>
                    <div className="text-xs text-muted-foreground">United States</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="ar">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇸🇦</span>
                  <div>
                    <div className="font-medium">العربية</div>
                    <div className="text-xs text-muted-foreground">Arabic</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t.currentLanguage}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {language === "ar" ? "🇸🇦 العربية" : "🇺🇸 English"}
            </Badge>
            {language === "ar" && (
              <Badge variant="secondary" className="text-xs">
                RTL
              </Badge>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• {t.languageDetection}</div>
          <div>• {t.rtlSupport}</div>
          <div>• Professional terminology in both languages</div>
        </div>
      </CardContent>
    </Card>
  );
}

// RTL-aware component wrapper
export function RTLWrapper({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  const { isRTL } = useEnhancedLanguage();
  const rtlClasses = getRTLClasses(isRTL);
  
  return (
    <div className={`${className} ${rtlClasses.textAlign}`}>
      {children}
    </div>
  );
}

// Number component with language formatting
export function LocalizedNumber({ 
  value, 
  className = "" 
}: { 
  value: number; 
  className?: string; 
}) {
  const { language } = useEnhancedLanguage();
  
  const formatNumber = (num: number, lang: string) => {
    return new Intl.NumberFormat(lang).format(num);
  };

  return (
    <span className={className}>
      {formatNumber(value, language)}
    </span>
  );
}

// Date component with language formatting
export function LocalizedDate({ 
  date, 
  className = "" 
}: { 
  date: Date; 
  className?: string; 
}) {
  const { language } = useEnhancedLanguage();
  
  const formatDate = (date: Date, lang: string) => {
    return new Intl.DateTimeFormat(lang).format(date);
  };

  return (
    <span className={className}>
      {formatDate(date, language)}
    </span>
  );
}

// Utility hook for RTL-aware styling
export function useRTLClasses() {
  const { isRTL } = useEnhancedLanguage();
  return getRTLClasses(isRTL);
}

// Translation helper hook
export function useTranslation() {
  const { translations } = useEnhancedLanguage();
  return translations;
}

// Quick language detection hook
export function useLanguageDetection() {
  const { language, setLanguage } = useEnhancedLanguage();
  
  const detectAndSetLanguage = (detectedLanguage: string) => {
    const detected = detectLanguageCode(detectedLanguage);
    if (detected !== language) {
      setLanguage(detected);
    }
  };
  
  return { detectAndSetLanguage };
} 