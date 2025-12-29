import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function Upgrade() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent...');
        
        // For now, send empty body - authenticated users don't need email/guestId
        // Guest users will be prompted for email in checkout form
        const response = await fetch("/api/subscription/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({}),
        });

        console.log('Payment intent response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Payment intent error:', errorData);
          throw new Error(errorData.message || "Failed to create payment intent");
        }

        const data = await response.json();
        console.log('Payment intent created successfully');
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Payment intent failed:', err);
        const errorMessage = err.message || "Failed to initialize payment. Please try again.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Payment initialization failed",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [toast]);

  const handlePaymentSuccess = () => {
    // Force a full page reload to ensure all user data is fresh
    setTimeout(() => {
      window.location.href = "/app";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Header with Logo */}
        <div className="flex items-center justify-between">
          <Logo size="lg" className="shadow-2xl" />
          <Button
            variant="ghost"
            onClick={() => setLocation("/app")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
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
                  <span className="text-4xl font-bold">$2.99</span>
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
              {!stripePublishableKey ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Stripe payment not configured</p>
                      <p className="text-sm">
                        Please add your Stripe publishable key to the environment variables.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Initializing secure payment...</p>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <CheckoutForm onSuccess={handlePaymentSuccess} />
                </Elements>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment system not configured. Please contact support.
                  </AlertDescription>
                </Alert>
              )}
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
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
