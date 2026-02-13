import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en' || i18n.language.startsWith('en-');

  const toggleLanguage = () => {
    const newLang = isEnglish ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      className="hidden sm:flex items-center gap-2 text-sm bg-muted rounded-full px-3 py-1.5 border border-border/50 cursor-pointer"
      onClick={toggleLanguage}
    >
      <span className={cn(
        "font-medium transition-colors",
        isEnglish ? "text-foreground" : "text-muted-foreground"
      )}>EN</span>
      <div className="w-10 h-5 bg-card rounded-full relative border border-border shadow-sm">
        <div className={cn(
          "absolute top-0.5 w-4 h-4 bg-primary rounded-full transition-all duration-300",
          isEnglish ? "left-0.5" : "left-[calc(100%-18px)]"
        )} />
      </div>
      <span className={cn(
        "font-medium transition-colors",
        !isEnglish ? "text-foreground" : "text-muted-foreground"
      )}>TA</span>
    </div>
  );
}
