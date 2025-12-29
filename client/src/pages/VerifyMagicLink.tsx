import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link } from "wouter";

export default function VerifyMagicLink() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      // Get token from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No magic link token provided");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-magic-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");

          // Handle different types of logins
          if (data.token && data.user) {
            // Authenticated user - store JWT token
            localStorage.setItem("authToken", data.token);
            console.log("Auth token stored, user:", data.user);
          } else if (data.guestPremium) {
            // Guest premium - store guestId
            localStorage.setItem("guestId", data.guestPremium.guestId);
            console.log("Guest premium stored, guestId:", data.guestPremium.guestId);
          }
          
          // Clean up URL by removing token
          window.history.replaceState({}, document.title, "/verify-magic-link");
          console.log("Verification successful, ready to navigate to /app");
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired magic link");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <Card>
          <CardContent className="pt-6">
            {status === "loading" && (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Verifying your magic link...</p>
                <p className="text-sm text-muted-foreground">Please wait a moment</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    <strong>Success!</strong>
                    <p className="mt-1">Login successful! Click below to continue.</p>
                  </AlertDescription>
                </Alert>
                <div style={{ padding: '20px 0' }}>
                  <a 
                    href="/app"
                    style={{
                      display: 'block',
                      padding: '16px 32px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                    onClick={() => console.log('Access Premium button clicked')}
                  >
                    Access Premium →
                  </a>
                </div>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Or manually go to: {window.location.origin}/app
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <XCircle className="h-12 w-12 mx-auto text-red-600" />
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Verification Failed</strong>
                    <p className="mt-1">{message}</p>
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col gap-2 mt-4">
                  <Button asChild variant="default">
                    <Link href="/magic-login">Request New Magic Link</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
