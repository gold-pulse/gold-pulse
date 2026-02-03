import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDerivWebSocket } from '@/hooks/useDerivWebSocket';
import { MarketSelector } from '@/components/trading/MarketSelector';
import { CandlestickChart } from '@/components/trading/CandlestickChart';
import { PriceDisplay } from '@/components/trading/PriceDisplay';
import { IndicatorPanel } from '@/components/trading/IndicatorPanel';
import { AccountPanel } from '@/components/trading/AccountPanel';
import { RSIChart } from '@/components/trading/RSIChart';
import { MACDChart } from '@/components/trading/MACDChart';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDerivOAuthUrl, MarketType, Timeframe, VOLATILITY_INDICES } from '@/lib/deriv';
import { TrendingUp, ExternalLink, Loader2, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading, activeDerivAccount, signOut } = useAuth();
  
  // Market state
  const [marketType, setMarketType] = useState<MarketType>('volatility');
  const [symbol, setSymbol] = useState<string>(VOLATILITY_INDICES[1].symbol); // V25 default
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  // Indicator toggles
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  // WebSocket connection
  const { candles, tick, balance, status, priceDirection } = useDerivWebSocket({
    symbol,
    timeframe,
    token: activeDerivAccount?.token,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-volt" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleMarketTypeChange = (type: MarketType) => {
    setMarketType(type);
    // Reset to first symbol of new market type
    if (type === 'volatility') {
      setSymbol(VOLATILITY_INDICES[1].symbol);
    } else {
      setSymbol('frxXAUUSD');
    }
  };

  const handleConnectDeriv = () => {
    window.location.href = getDerivOAuthUrl();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-volt">
              <TrendingUp className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold">Gold Pulse</span>
          </div>

          <div className="flex items-center gap-4">
            {activeDerivAccount ? (
              <AccountPanel balance={balance} />
            ) : (
              <Button onClick={handleConnectDeriv} className="gap-2 bg-volt text-background hover:bg-volt/90">
                <ExternalLink className="h-4 w-4" />
                Connect Deriv
              </Button>
            )}
            
            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Chart and Indicators */}
          <div className="space-y-6 lg:col-span-2">
            {/* Market Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <MarketSelector
                marketType={marketType}
                symbol={symbol}
                timeframe={timeframe}
                onMarketTypeChange={handleMarketTypeChange}
                onSymbolChange={setSymbol}
                onTimeframeChange={setTimeframe}
              />
              <PriceDisplay
                tick={tick}
                symbol={symbol}
                status={status}
                priceDirection={priceDirection as 'up' | 'down' | 'same'}
              />
            </div>

            {/* Chart Card */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Live Chart</CardTitle>
                  <IndicatorPanel
                    showSMA={showSMA}
                    showEMA={showEMA}
                    showRSI={showRSI}
                    showMACD={showMACD}
                    onToggleSMA={setShowSMA}
                    onToggleEMA={setShowEMA}
                    onToggleRSI={setShowRSI}
                    onToggleMACD={setShowMACD}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <CandlestickChart
                    candles={candles}
                    showSMA={showSMA}
                    showEMA={showEMA}
                  />
                </div>
                
                {/* RSI Panel */}
                {showRSI && candles.length > 0 && (
                  <div className="mt-2 border-t border-border/30 pt-2">
                    <RSIChart candles={candles} />
                  </div>
                )}

                {/* MACD Panel */}
                {showMACD && candles.length > 0 && (
                  <div className="mt-2 border-t border-border/30 pt-2">
                    <MACDChart candles={candles} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="space-y-6">
            {/* Trading Panel */}
            <TradingPanel
              symbol={symbol}
              currentPrice={tick?.price ?? null}
              isConnected={!!activeDerivAccount}
            />

            {/* Connect Deriv CTA (if not connected) */}
            {!activeDerivAccount && (
              <Card className="border-volt/30 bg-volt/5">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold">Connect Your Deriv Account</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Link your Deriv account to enable live trading and view your balance.
                    </p>
                    <Button 
                      onClick={handleConnectDeriv} 
                      className="mt-4 gap-2 bg-volt text-background hover:bg-volt/90"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Connect Deriv
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
