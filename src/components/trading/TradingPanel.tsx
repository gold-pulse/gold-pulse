import { useState } from 'react';
import { Bot, Copy, TrendingUp, TrendingDown, Settings, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradingPanelProps {
  symbol: string;
  currentPrice: number | null;
  isConnected: boolean;
}

export function TradingPanel({ symbol, currentPrice, isConnected }: TradingPanelProps) {
  const [mode, setMode] = useState<'bot' | 'copy'>('bot');
  const [botEnabled, setBotEnabled] = useState(false);
  const [lotSize, setLotSize] = useState('0.01');
  const [copySignal, setCopySignal] = useState<'buy' | 'sell' | 'wait'>('wait');

  // Simulated signal based on random for demo (replace with actual logic)
  const generateSignal = (): 'buy' | 'sell' | 'wait' => {
    const signals: ('buy' | 'sell' | 'wait')[] = ['buy', 'sell', 'wait'];
    return signals[Math.floor(Math.random() * 3)];
  };

  const handleRefreshSignal = () => {
    setCopySignal(generateSignal());
  };

  const lotSizes = ['0.01', '0.05', '0.10', '0.25', '0.50', '1.00', '2.00', '5.00'];

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-volt" />
          Trading Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'bot' | 'copy')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bot" className="gap-2">
              <Bot className="h-4 w-4" />
              Auto Bot
            </TabsTrigger>
            <TabsTrigger value="copy" className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Trade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bot" className="mt-4 space-y-4">
            {!isConnected ? (
              <div className="rounded-lg border border-border/50 bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Connect your Deriv account to enable bot trading
                </p>
              </div>
            ) : (
              <>
                {/* Bot Enable Toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${botEnabled ? 'bg-success' : 'bg-muted'}`}>
                      <Power className={`h-5 w-5 ${botEnabled ? 'text-success-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Auto Trading Bot</p>
                      <p className="text-xs text-muted-foreground">
                        {botEnabled ? 'Bot is actively trading' : 'Bot is disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={botEnabled}
                    onCheckedChange={setBotEnabled}
                    className="data-[state=checked]:bg-success"
                  />
                </div>

                {/* Lot Size Selection */}
                <div className="space-y-2">
                  <Label>Lot Size / Stake Amount</Label>
                  <Select value={lotSize} onValueChange={setLotSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lot size" />
                    </SelectTrigger>
                    <SelectContent>
                      {lotSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} {parseFloat(size) < 1 ? 'mini' : parseFloat(size) >= 1 ? 'standard' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Amount per trade: ${lotSize}
                  </p>
                </div>

                {/* Bot Status */}
                {botEnabled && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                      <span className="text-sm font-medium text-success">Bot Active</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Monitoring {symbol} for trading opportunities...
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="copy" className="mt-4 space-y-4">
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Get trading signals based on market analysis. Follow the signal to place your trade manually.
              </p>
              
              {/* Signal Display */}
              <div className="mb-4 rounded-lg border border-border/50 bg-muted/30 p-6">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Current Signal for {symbol}
                </p>
                
                {copySignal === 'wait' && (
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    ⏳ Wait for Signal
                  </Badge>
                )}
                
                {copySignal === 'buy' && (
                  <Badge className="bg-success px-4 py-2 text-lg text-success-foreground">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    BUY Signal
                  </Badge>
                )}
                
                {copySignal === 'sell' && (
                  <Badge className="bg-destructive px-4 py-2 text-lg text-destructive-foreground">
                    <TrendingDown className="mr-2 h-5 w-5" />
                    SELL Signal
                  </Badge>
                )}

                {currentPrice && copySignal !== 'wait' && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Entry Price: <span className="font-mono font-semibold">{currentPrice.toFixed(2)}</span>
                  </p>
                )}
              </div>

              <Button 
                onClick={handleRefreshSignal}
                variant="outline"
                className="w-full"
              >
                Refresh Signal
              </Button>

              <p className="mt-4 text-xs text-muted-foreground">
                ⚠️ Signals are for educational purposes. Always do your own analysis before trading.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
