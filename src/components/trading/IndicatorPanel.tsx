import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface IndicatorPanelProps {
  showSMA: boolean;
  showEMA: boolean;
  showRSI: boolean;
  showMACD: boolean;
  onToggleSMA: (enabled: boolean) => void;
  onToggleEMA: (enabled: boolean) => void;
  onToggleRSI: (enabled: boolean) => void;
  onToggleMACD: (enabled: boolean) => void;
}

export function IndicatorPanel({
  showSMA,
  showEMA,
  showRSI,
  showMACD,
  onToggleSMA,
  onToggleEMA,
  onToggleRSI,
  onToggleMACD,
}: IndicatorPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border/50 bg-card/50 px-4 py-2">
      <span className="text-sm font-medium text-muted-foreground">Indicators:</span>
      
      <div className="flex items-center gap-2">
        <Switch id="sma" checked={showSMA} onCheckedChange={onToggleSMA} />
        <Label htmlFor="sma" className="cursor-pointer text-sm">
          <span className="text-volt">SMA</span>
          <span className="ml-1 text-muted-foreground">(20)</span>
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="ema" checked={showEMA} onCheckedChange={onToggleEMA} />
        <Label htmlFor="ema" className="cursor-pointer text-sm">
          <span className="text-volt-accent">EMA</span>
          <span className="ml-1 text-muted-foreground">(12)</span>
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="rsi" checked={showRSI} onCheckedChange={onToggleRSI} />
        <Label htmlFor="rsi" className="cursor-pointer text-sm">RSI</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="macd" checked={showMACD} onCheckedChange={onToggleMACD} />
        <Label htmlFor="macd" className="cursor-pointer text-sm">MACD</Label>
      </div>
    </div>
  );
}
