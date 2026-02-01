import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketType, getMarketSymbols, TIMEFRAMES, Timeframe } from '@/lib/deriv';

interface MarketSelectorProps {
  marketType: MarketType;
  symbol: string;
  timeframe: Timeframe;
  onMarketTypeChange: (type: MarketType) => void;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

export function MarketSelector({
  marketType,
  symbol,
  timeframe,
  onMarketTypeChange,
  onSymbolChange,
  onTimeframeChange,
}: MarketSelectorProps) {
  const symbols = getMarketSymbols(marketType);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Market Type Tabs */}
      <Tabs value={marketType} onValueChange={(v) => onMarketTypeChange(v as MarketType)}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="volatility" className="data-[state=active]:bg-volt/20 data-[state=active]:text-volt">
            Volatility
          </TabsTrigger>
          <TabsTrigger value="forex" className="data-[state=active]:bg-volt/20 data-[state=active]:text-volt">
            Forex
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Symbol Selector */}
      <Select value={symbol} onValueChange={onSymbolChange}>
        <SelectTrigger className="w-[180px] border-border/50 bg-card">
          <SelectValue placeholder="Select market" />
        </SelectTrigger>
        <SelectContent>
          {symbols.map((s) => (
            <SelectItem key={s.symbol} value={s.symbol}>
              {s.shortName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Timeframe Buttons */}
      <div className="flex gap-1">
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf.value}
            variant={timeframe === tf.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTimeframeChange(tf.value)}
            className={timeframe === tf.value ? 'bg-volt text-background hover:bg-volt/90' : 'text-muted-foreground hover:text-foreground'}
          >
            {tf.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
