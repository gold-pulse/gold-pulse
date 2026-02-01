import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { Candle } from '@/hooks/useDerivWebSocket';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD } from '@/lib/indicators';

interface CandlestickChartProps {
  candles: Candle[];
  showSMA?: boolean;
  showEMA?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
}

export function CandlestickChart({
  candles,
  showSMA = true,
  showEMA = false,
  showRSI = false,
  showMACD = false,
}: CandlestickChartProps) {
  const chartData = useMemo(() => {
    if (candles.length === 0) return [];

    const sma20 = showSMA ? calculateSMA(candles, 20) : [];
    const ema12 = showEMA ? calculateEMA(candles, 12) : [];
    const rsi = showRSI ? calculateRSI(candles, 14) : [];
    const macd = showMACD ? calculateMACD(candles) : [];

    return candles.map((candle, i) => {
      const isGreen = candle.close >= candle.open;
      
      return {
        time: new Date(candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        // For candlestick visualization
        wickHigh: candle.high,
        wickLow: candle.low,
        bodyTop: Math.max(candle.open, candle.close),
        bodyBottom: Math.min(candle.open, candle.close),
        bodyHeight: Math.abs(candle.close - candle.open) || 0.0001,
        isGreen,
        fill: isGreen ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
        // Indicators
        sma20: sma20[i] ?? undefined,
        ema12: ema12[i] ?? undefined,
        rsi: rsi[i] ?? undefined,
        macd: macd[i]?.macd ?? undefined,
        macdSignal: macd[i]?.signal ?? undefined,
        macdHistogram: macd[i]?.histogram ?? undefined,
      };
    });
  }, [candles, showSMA, showEMA, showRSI, showMACD]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  // Calculate Y-axis domain with padding
  const prices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis 
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            orientation="right"
            tickFormatter={(value) => value.toFixed(2)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                close: 'Close',
                open: 'Open',
                high: 'High',
                low: 'Low',
                sma20: 'SMA 20',
                ema12: 'EMA 12',
              };
              return [value?.toFixed(4), labels[name] || name];
            }}
          />
          
          {/* Candlestick wicks */}
          {chartData.map((entry, index) => (
            <ReferenceLine
              key={`wick-${index}`}
              segment={[
                { x: entry.time, y: entry.low },
                { x: entry.time, y: entry.high },
              ]}
              stroke={entry.fill}
              strokeWidth={1}
            />
          ))}
          
          {/* Candlestick bodies using Bar */}
          <Bar
            dataKey="bodyHeight"
            fill="hsl(var(--success))"
            stroke="none"
            barSize={6}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              const fillColor = payload.isGreen ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';
              const yPos = payload.bodyTop;
              
              // Calculate the actual y position based on the chart scale
              const chartHeight = props.background?.height || 300;
              const yScale = chartHeight / (maxPrice - minPrice + 2 * padding);
              const adjustedY = (maxPrice + padding - yPos) * yScale + 10;
              const adjustedHeight = Math.max(height, 2);
              
              return (
                <rect
                  x={x}
                  y={adjustedY}
                  width={width}
                  height={adjustedHeight}
                  fill={fillColor}
                  rx={1}
                />
              );
            }}
          />

          {/* Moving Averages */}
          {showSMA && (
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="hsl(var(--volt))"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
          {showEMA && (
            <Line
              type="monotone"
              dataKey="ema12"
              stroke="hsl(var(--volt-accent))"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
