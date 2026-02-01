import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface DerivAccount {
  account: string;
  token: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  derivAccounts: DerivAccount[];
  activeDerivAccount: DerivAccount | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setDerivAccounts: (accounts: DerivAccount[]) => void;
  setActiveDerivAccount: (account: DerivAccount | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [derivAccounts, setDerivAccounts] = useState<DerivAccount[]>([]);
  const [activeDerivAccount, setActiveDerivAccount] = useState<DerivAccount | null>(null);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load Deriv accounts from localStorage on mount
  useEffect(() => {
    const storedAccounts = localStorage.getItem('deriv_accounts');
    const storedActive = localStorage.getItem('deriv_active_account');
    
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      setDerivAccounts(accounts);
      
      if (storedActive) {
        const active = JSON.parse(storedActive);
        setActiveDerivAccount(active);
      } else if (accounts.length > 0) {
        setActiveDerivAccount(accounts[0]);
      }
    }
  }, []);

  // Persist Deriv accounts to localStorage
  useEffect(() => {
    if (derivAccounts.length > 0) {
      localStorage.setItem('deriv_accounts', JSON.stringify(derivAccounts));
    }
  }, [derivAccounts]);

  useEffect(() => {
    if (activeDerivAccount) {
      localStorage.setItem('deriv_active_account', JSON.stringify(activeDerivAccount));
    }
  }, [activeDerivAccount]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setDerivAccounts([]);
    setActiveDerivAccount(null);
    localStorage.removeItem('deriv_accounts');
    localStorage.removeItem('deriv_active_account');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        derivAccounts,
        activeDerivAccount,
        isLoading,
        signUp,
        signIn,
        signOut,
        setDerivAccounts,
        setActiveDerivAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
