import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { parseDerivOAuthCallback } from '@/lib/deriv';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DerivCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setDerivAccounts, setActiveDerivAccount, user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }

    const accounts = parseDerivOAuthCallback(searchParams);

    if (accounts.length > 0) {
      setDerivAccounts(accounts);
      setActiveDerivAccount(accounts[0]);
      toast.success(`Connected ${accounts.length} Deriv account(s)`);
      navigate('/dashboard');
    } else {
      toast.error('Failed to connect Deriv account');
      navigate('/dashboard');
    }
  }, [searchParams, navigate, setDerivAccounts, setActiveDerivAccount, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-volt" />
      <p className="text-muted-foreground">Connecting your Deriv account...</p>
    </div>
  );
}
