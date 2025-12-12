import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        toast({
          title: "Payment successful!",
          description: "Your premium subscription has been activated.",
        });
        onSuccess();
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
            Pay $2.99
          </>
        )}
      </Button>

      <div className="text-xs text-center text-muted-foreground space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Secure payment by Stripe</span>
        </div>
        <div>No recurring charges - one-time payment</div>
      </div>
    </form>
  );
}
