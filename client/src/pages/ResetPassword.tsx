import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useResetPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetPassword() {
  const [location, setLocation] = useLocation();
  const resetPassword = useResetPassword();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }
    
    // Check password confirmation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setPasswordError('Invalid or missing reset token');
      return;
    }
    
    try {
      await resetPassword.mutateAsync({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => setLocation('/login'), 3000);
    } catch (error) {
      // Error is handled by mutation state
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Password Reset</CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                You can now sign in with your new password. Redirecting to login...
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Link href="/login">
              <a className="text-blue-600 hover:underline text-sm mx-auto">
                Go to sign in
              </a>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Invalid Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Please request a new password reset link.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/forgot-password">
              <a className="text-blue-600 hover:underline text-sm">
                Request new reset link
              </a>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {resetPassword.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {resetPassword.error?.message || 'Failed to reset password. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                autoComplete="new-password"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={resetPassword.isPending || !!passwordError}
            >
              {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
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
  );
}
