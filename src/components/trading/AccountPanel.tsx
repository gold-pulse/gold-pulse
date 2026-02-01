import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface AccountPanelProps {
  balance: number | null;
}

export function AccountPanel({ balance }: AccountPanelProps) {
  const { derivAccounts, activeDerivAccount, setActiveDerivAccount, signOut } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {/* Balance Display */}
      {balance !== null && (
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
          <Wallet className="h-4 w-4 text-volt" />
          <span className="font-mono text-sm font-semibold">
            {activeDerivAccount?.currency || 'USD'} {balance.toFixed(2)}
          </span>
        </div>
      )}

      {/* Account Selector */}
      {derivAccounts.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="font-mono text-xs">{activeDerivAccount?.account}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {derivAccounts.map((account) => (
              <DropdownMenuItem
                key={account.account}
                onClick={() => setActiveDerivAccount(account)}
                className={account.account === activeDerivAccount?.account ? 'bg-accent' : ''}
              >
                <span className="font-mono text-xs">{account.account}</span>
                <span className="ml-2 text-muted-foreground">{account.currency}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
