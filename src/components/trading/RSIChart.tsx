import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { Candle } from '@/hooks/useDerivWebSocket';
import { calculateRSI } from '@/lib/indicators';
import { useMemo } from 'react';

interface RSIChartProps {
  candles: Candle[];
}

export function RSIChart({ candles }: RSIChartProps) {
  const chartData = useMemo(() => {
    const rsiValues = calculateRSI(candles, 14);
    
    return candles.map((candle, i) => ({
      time: new Date(candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rsi: rsiValues[i] ?? undefined,
    }));
  }, [candles]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="time" 
            tick={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            orientation="right"
            width={40}
            ticks={[30, 50, 70]}
          />
          <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="hsl(var(--success))" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="rsi"
            stroke="hsl(var(--volt))"
            fill="hsl(var(--volt) / 0.2)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-between px-2 text-[10px] text-muted-foreground">
        <span>RSI (14)</span>
        <span className="text-volt">{chartData[chartData.length - 1]?.rsi?.toFixed(1) ?? '--'}</span>
      </div>
    </div>
  );
}
