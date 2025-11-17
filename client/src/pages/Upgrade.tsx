import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Lock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoImage from "@assets/generated_images/QuizBanner_logo_primary_blue_2dd318cd.png";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function Upgrade() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Header with Logo */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="QuizBanner Logo" 
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited learning potential with advanced import features and 5x more questions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle>What You Get</CardTitle>
              <CardDescription>Premium features included</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">50 Question Pairs</div>
                    <div className="text-sm text-muted-foreground">5x more than free tier</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">CSV Import</div>
                    <div className="text-sm text-muted-foreground">Bulk import from Excel or Google Sheets</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Paste Text Import</div>
                    <div className="text-sm text-muted-foreground">Copy & paste questions directly</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Cloud Sync</div>
                    <div className="text-sm text-muted-foreground">Access from any device</div>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$1.99</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  12 months of premium access
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form Mockup */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Secure Payment
              </CardTitle>
              <CardDescription>Your payment information is encrypted and secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Payment Element Placeholder */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-element">Card Information</Label>
                  <div 
                    id="card-element" 
                    className="border rounded-md p-4 bg-muted/30"
                  >
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CreditCard className="w-5 h-5" />
                      <span>Card number will appear here</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-muted-foreground">
                      <div>MM / YY</div>
                      <div>CVC</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Powered by Stripe - Accepts all major credit cards
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing-email">Email for Receipt</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    placeholder="your@email.com"
                    disabled
                    data-testid="input-billing-email"
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled
                data-testid="button-pay"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pay $1.99 (Preview Mode)
              </Button>

              <div className="text-xs text-center text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Secure payment by Stripe</span>
                </div>
                <div>No recurring charges - one-time payment</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center space-y-4 pt-4">
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Money-back Guarantee</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Note: This is a preview mockup. Actual payment processing will be enabled once Stripe API keys are configured.
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
