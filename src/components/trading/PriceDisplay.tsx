import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TickData } from '@/hooks/useDerivWebSocket';

interface PriceDisplayProps {
  tick: TickData | null;
  symbol: string;
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  priceDirection: 'up' | 'down' | 'same';
}

export function PriceDisplay({ tick, symbol, status, priceDirection }: PriceDisplayProps) {
  const StatusIcon = {
    connecting: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    connected: <Wifi className="h-4 w-4 text-success" />,
    error: <WifiOff className="h-4 w-4 text-destructive" />,
    disconnected: <WifiOff className="h-4 w-4 text-muted-foreground" />,
  }[status];

  const DirectionIcon = {
    up: <TrendingUp className="h-5 w-5" />,
    down: <TrendingDown className="h-5 w-5" />,
    same: <Minus className="h-5 w-5" />,
  }[priceDirection];

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {StatusIcon}
        <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'font-mono text-2xl font-bold tabular-nums transition-colors duration-200',
            priceDirection === 'up' && 'text-success',
            priceDirection === 'down' && 'text-destructive',
            priceDirection === 'same' && 'text-foreground'
          )}
        >
          {tick?.price?.toFixed(4) ?? '---'}
        </span>
        <span
          className={cn(
            'transition-colors duration-200',
            priceDirection === 'up' && 'text-success',
            priceDirection === 'down' && 'text-destructive',
            priceDirection === 'same' && 'text-muted-foreground'
          )}
        >
          {DirectionIcon}
        </span>
      </div>

      {tick?.time && (
        <span className="text-xs text-muted-foreground">
          {tick.time.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
