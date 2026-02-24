import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Link } from "wouter";
import { AnimatedBanners } from "@/components/AnimatedBanners";

export default function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to send magic link");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedBanners />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20 relative z-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Access Your Premium Account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a secure login link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Check your email!</strong>
                  <p className="mt-1">
                    We've sent a magic link to <strong>{email}</strong>. Click the link in the email to access your premium account.
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    The link will expire in 1 hour. Didn't receive it? Check your spam folder or try again.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>This is for premium users only.</p>
                  <p className="mt-2">
                    Don't have premium?{" "}
                    <Link href="/upgrade" className="text-primary hover:underline font-medium">
                      Upgrade now for 99¢/month
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {success && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  Send Another Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
