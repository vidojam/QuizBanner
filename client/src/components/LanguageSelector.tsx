import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, changeLanguage, t } = useTranslation();

  const handleLanguageChange = (newLanguage: string) => {
    console.log('Language changing to:', newLanguage);
    changeLanguage(newLanguage as 'en' | 'es');
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}