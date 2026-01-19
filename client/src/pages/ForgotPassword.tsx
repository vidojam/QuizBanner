import { useState } from 'react';
import { Link } from 'wouter';
import { useForgotPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedBanners } from '@/components/AnimatedBanners';

export default function ForgotPassword() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await forgotPassword.mutateAsync(email);
      setSuccess(true);
    } catch (error) {
      // Error is handled by mutation state
    }
  };

  if (success) {
    return (
      <>
        <AnimatedBanners />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative z-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent password reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                If an account exists with <strong>{email}</strong>, you will receive an email with instructions to reset your password.
                Please check your spam folder if you don't see it.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/login">
              <a className="text-blue-600 hover:underline text-sm">
                Return to sign in
              </a>
            </Link>
          </CardFooter>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBanners />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative z-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {forgotPassword.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {forgotPassword.error?.message || 'Failed to send reset email. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            Remember your password?{' '}
            <Link href="/login">
              <a className="text-blue-600 hover:underline font-medium">
                Sign in
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
