import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AnimatedBanners } from "@/components/AnimatedBanners";

interface PlanSelectionProps {
  onPlanSelected: (plan: 'free' | 'premium') => void;
}

export default function PlanSelection({ onPlanSelected }: PlanSelectionProps) {
  const { t, language } = useTranslation();

  // Force re-render when language changes
  console.log('PlanSelection rendering with language:', language);

  return (
    <>
      <AnimatedBanners />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4 relative z-10">
      <div className="max-w-4xl w-full space-y-8" key={`plan-content-${language}`}>
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <Logo size="lg" className="shadow-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            {t('planSelectionTitle')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('planSelectionSubtitle')}
          </p>
        </div>

        {/* Plan Cards with Integrated Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="hover:shadow-lg flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  F
                </div>
                {t('freePlanTitle')}
              </CardTitle>
              <div className="text-3xl font-bold">{t('freePlanPrice')}</div>
              <p className="text-muted-foreground">{t('perfectForStarting')}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('upTo10Questions')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('basicScreensaver')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('manualEntry')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('basicCustomization')}</span>
                </li>
              </ul>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onPlanSelected('free')}
                  className="w-full text-lg py-6 bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  Continue With Free Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="hover:shadow-lg flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Star className="w-4 h-4" />
                </div>
                {t('premiumPlanTitle')}
              </CardTitle>
              <div className="text-3xl font-bold">{t('premiumPlanPrice')}</div>
              <p className="text-muted-foreground">{t('unlockFullPotential')}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{t('upTo50Questions')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{t('csvImport')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{t('pasteImport')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{t('advancedCustomization')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('allFreeFeatures')}</span>
                </li>
              </ul>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={() => onPlanSelected('premium')}
                  className="w-full text-lg py-6"
                >
                  Continue With Premium Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Copyright */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} QuizBanner. All rights reserved.
              </div>
              <div className="text-xs text-gray-400">
                Developed by vidojam
              </div>
            </div>
            <p className="text-sm text-black font-bold">
              {t('learnSmarter')}
            </p>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}