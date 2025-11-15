import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import logoImage from "@assets/generated_images/QuizBanner_logo_with_larger_QB_8931337e.png";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="QuizBanner Logo" 
                className="h-full w-full object-contain"
                style={{ filter: 'brightness(1.8) saturate(0.3)' }}
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Learn Smarter with Banner Q&A
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reinforce your knowledge with beautiful, customizable scrolling banners that keep your Q&A pairs top of mind.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-free"
              className="text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-premium"
              className="text-lg px-8 py-6"
            >
              Upgrade to Premium
            </Button>
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
                <div className="text-3xl font-bold">$1.99</div>
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

        <div className="text-center text-sm text-muted-foreground">
          Sign in to get started with your free account
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
