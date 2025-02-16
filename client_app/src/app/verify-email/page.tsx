'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await userService.verifyEmail(token as string);
        if (response.success) {
          setVerificationStatus('success');
          setMessage('Email verified successfully!');
          toast.success('Email verification successful');
        } else {
          setVerificationStatus('error');
          setMessage(response.message || 'Verification failed');
          toast.error(response.message || 'Verification failed');
        }
      } catch (error: any) {
        setVerificationStatus('error');
        setMessage(error.message || 'Verification failed');
        toast.error(error.message || 'Verification failed');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  const handleNavigate = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {verificationStatus === 'loading' ? (
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            ) : verificationStatus === 'success' ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p
            className={`mt-2 text-sm ${
              verificationStatus === 'error'
                ? 'text-red-600'
                : verificationStatus === 'success'
                ? 'text-green-600'
                : 'text-gray-600'
            }`}>
            {message}
          </p>
        </div>

        {verificationStatus !== 'loading' && (
          <div className="mt-8">
            <Button
              onClick={handleNavigate}
              className="w-full bg-blue-600 text-white hover:bg-blue-700">
              {verificationStatus === 'success'
                ? 'Proceed to Login'
                : 'Back to Login'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
