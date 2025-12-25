import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Landing() {
  const { t, language } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8" key={`landing-${language}`}>
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>
          
          {/* Logo and Hero Section */}
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <Logo size="lg" className="shadow-2xl" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-700">
              {t('landingTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landingSubtitle')}
            </p>
            <div className="pt-4 flex flex-wrap gap-4 justify-center">
              <Link href="/app">
                <Button 
                  size="lg" 
                  variant="default"
                  data-testid="button-try-free"
                  className="text-2xl px-8 py-6 w-64"
                >
                  Try Banners for Free
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button 
                  size="lg" 
                  variant="default"
                  data-testid="button-login"
                  className="text-2xl px-8 py-6 w-64"
                >
                  Premium
                </Button>
              </Link>
            </div>
            <div className="text-center mt-4">
              <p className="text-2xl font-bold">
                Already paid for premium?{" "}
                <Link href="/magic-login" className="text-primary hover:underline">
                  Access your account →
                </Link>
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    F
                  </div>
                  Free Tier
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$0</div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Up to 10 question-answer pairs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Manual question entry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Customizable banners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Playback controls</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    P
                  </div>
                  Premium
                </CardTitle>
                <CardDescription>Unlock powerful features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">$2.99</div>
                  <div className="text-sm text-muted-foreground">one-time payment for 12 months</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Up to 50 question-answer pairs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="font-semibold">CSV file import</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Paste text import</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>All Free tier features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground font-bold">
            Sign in to get started with your free account or premium account
          </div>

          {/* Footer with Copyright */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="text-sm text-gray-500">
                  © {new Date().getFullYear()} QuizBanner. All rights reserved.
                </div>
                <div className="flex gap-4">
                  <Link href="/terms">
                    <a className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                      Terms of Service
                    </a>
                  </Link>
                  <Link href="/privacy">
                    <a className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                      Privacy Policy
                    </a>
                  </Link>
                  <Link href="/contact">
                    <a className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                      Contact Us
                    </a>
                  </Link>
                </div>
                <div className="text-xs text-gray-400">
                  Developed by vidojam
                </div>
              </div>
              <p className="text-sm text-black font-bold">
                Learn smarter with customizable scrolling banners • Enhanced spaced repetition • Visual learning reinforcement
              </p>
            </div>
          </footer>
        </div>
      </div>
      <Footer />
    </div>
  );
}