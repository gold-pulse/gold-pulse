import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { parseDerivOAuthCallback } from '@/lib/deriv';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DerivCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setDerivAccounts, setActiveDerivAccount, user, isLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Check if user is logged in
    if (!user) {
      setStatus('error');
      setErrorMessage('Please sign in first to connect your Deriv account');
      toast.error('Please sign in first');
      setTimeout(() => navigate('/auth'), 2000);
      return;
    }

    // Parse the OAuth callback parameters
    const accounts = parseDerivOAuthCallback(searchParams);

    if (accounts.length > 0) {
      setDerivAccounts(accounts);
      setActiveDerivAccount(accounts[0]);
      setStatus('success');
      toast.success(`Connected ${accounts.length} Deriv account(s)`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setStatus('error');
      setErrorMessage('Failed to connect Deriv account. Please try again.');
      toast.error('Failed to connect Deriv account');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [searchParams, navigate, setDerivAccounts, setActiveDerivAccount, user, isLoading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-volt" />
          <p className="text-muted-foreground">Connecting your Deriv account...</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <p className="font-medium text-success">Deriv account connected!</p>
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <p className="font-medium text-destructive">Connection Failed</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </>
      )}
    </div>
  );
}
