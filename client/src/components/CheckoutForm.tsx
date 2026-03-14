import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface CheckoutFormProps {
  onSuccess: () => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/app`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message || "An error occurred during payment processing.",
        });
      } else {
        // Call backend to confirm payment and upgrade user
        try {
          const confirmResponse = await fetch('/api/subscription/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            console.error('Failed to confirm payment on backend:', errorData);
            toast({
              variant: "destructive",
              title: "Payment processed but upgrade failed",
              description: "Please contact support. Your payment was successful.",
            });
          } else {
            // Force refresh user data
            await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            
            toast({
              title: "Payment successful!",
              description: "Your premium subscription has been activated.",
            });
            
            // Wait a moment for cache to update
            setTimeout(() => {
              onSuccess();
            }, 500);
          }
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          toast({
            variant: "destructive",
            title: "Payment processed but upgrade failed",
            description: "Please refresh the page or contact support.",
          });
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment error",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit"
        className="w-full h-11" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay 99¢
          </>
        )}
      </Button>

      <div className="text-xs text-center text-muted-foreground space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Secure payment by Stripe</span>
        </div>
        <div>One-time payment for 1 month of premium access</div>
      </div>
    </form>
  );
}
