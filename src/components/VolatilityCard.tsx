import { useVolatilityPrice } from '@/hooks/useGoldPrice';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff, RefreshCw, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VolatilityCard() {
  const { price, lastUpdated, status, priceDirection, error, reconnect } = useVolatilityPrice();

  const formatPrice = (value: number) => {
    return value.toFixed(4);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="volt-card">
      <div className="volt-card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="volt-icon">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Volatility 25</h2>
              <p className="text-sm text-muted-foreground">Synthetic Index</p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className={cn(
            "status-badge",
            status === 'connected' && "status-connected",
            status === 'connecting' && "status-connecting",
            (status === 'error' || status === 'disconnected') && "status-error"
          )}>
            {status === 'connected' && <Wifi className="w-3 h-3" />}
            {status === 'connecting' && <RefreshCw className="w-3 h-3 animate-spin" />}
            {(status === 'error' || status === 'disconnected') && <WifiOff className="w-3 h-3" />}
            <span className="text-xs capitalize">{status}</span>
          </div>
        </div>

        {/* Price display */}
        <div className="text-center py-6">
          {price !== null ? (
            <>
              <div className={cn(
                "price-display",
                priceDirection === 'up' && "price-up",
                priceDirection === 'down' && "price-down"
              )}>
                {formatPrice(price)}
                <span className="price-direction-icon">
                  {priceDirection === 'up' && <TrendingUp className="w-8 h-8" />}
                  {priceDirection === 'down' && <TrendingDown className="w-8 h-8" />}
                  {priceDirection === 'same' && <Minus className="w-8 h-8 text-muted-foreground" />}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-4">index points</p>
            </>
          ) : (
            <div className="price-loading">
              {status === 'error' ? (
                <button 
                  onClick={reconnect}
                  className="reconnect-button"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reconnect
                </button>
              ) : (
                <>
                  <div className="loading-shimmer" />
                  <p className="text-sm text-muted-foreground mt-3">Connecting to market data...</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer with last update */}
        <div className="card-footer">
          {lastUpdated ? (
            <p className="text-xs text-muted-foreground">
              Last updated: {formatTime(lastUpdated)}
            </p>
          ) : error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Waiting for data...</p>
          )}
          <div className="live-indicator">
            <span className="live-dot" />
            <span className="text-xs font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
