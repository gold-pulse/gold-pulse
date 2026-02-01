import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { Candle } from '@/hooks/useDerivWebSocket';
import { calculateMACD } from '@/lib/indicators';
import { useMemo } from 'react';

interface MACDChartProps {
  candles: Candle[];
}

export function MACDChart({ candles }: MACDChartProps) {
  const chartData = useMemo(() => {
    const macdValues = calculateMACD(candles);
    
    return candles.map((candle, i) => ({
      time: new Date(candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      macd: macdValues[i]?.macd ?? undefined,
      signal: macdValues[i]?.signal ?? undefined,
      histogram: macdValues[i]?.histogram ?? undefined,
      histogramColor: (macdValues[i]?.histogram ?? 0) >= 0 
        ? 'hsl(142, 76%, 36%)' 
        : 'hsl(0, 84%, 60%)',
    }));
  }, [candles]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="time" 
            tick={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            orientation="right"
            width={40}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" />
          <Bar
            dataKey="histogram"
            fill="hsl(var(--volt) / 0.5)"
            barSize={3}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={height < 0 ? y + height : y}
                  width={width}
                  height={Math.abs(height)}
                  fill={payload.histogramColor}
                />
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="macd"
            stroke="hsl(var(--volt))"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke="hsl(var(--volt-accent))"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex justify-between px-2 text-[10px] text-muted-foreground">
        <span>MACD (12, 26, 9)</span>
        <div className="flex gap-2">
          <span className="text-volt">M: {chartData[chartData.length - 1]?.macd?.toFixed(4) ?? '--'}</span>
          <span className="text-volt-accent">S: {chartData[chartData.length - 1]?.signal?.toFixed(4) ?? '--'}</span>
        </div>
      </div>
    </div>
  );
}
