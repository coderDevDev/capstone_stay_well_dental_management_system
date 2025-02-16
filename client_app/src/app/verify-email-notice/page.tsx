'use client';

import { Button } from '@/components/ui/button';
import { userService } from '@/services/api';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function VerifyEmailNotice() {
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tempEmail') || '');
    } catch {
      return '';
    }
  });

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await userService.resendVerification(email);
      if (response.success) {
        toast.success('Verification email sent successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleResendVerification}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-blue-600 text-white hover:bg-blue-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend verification email'
            )}
          </Button>
          <p className="text-xs text-center text-gray-500">
            Didn't receive the email? Check your spam folder or click above to
            resend.
          </p>
        </div>
      </div>
    </div>
  );
}
