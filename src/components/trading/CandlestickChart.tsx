import { useMemo, useRef, useEffect } from 'react';
import type { Candle } from '@/hooks/useDerivWebSocket';
import { calculateSMA, calculateEMA } from '@/lib/indicators';

interface CandlestickChartProps {
  candles: Candle[];
  showSMA?: boolean;
  showEMA?: boolean;
}

export function CandlestickChart({
  candles,
  showSMA = true,
  showEMA = false,
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const chartData = useMemo(() => {
    if (candles.length === 0) return { candles: [], sma20: [], ema12: [], minPrice: 0, maxPrice: 0 };

    const sma20 = showSMA ? calculateSMA(candles, 20) : [];
    const ema12 = showEMA ? calculateEMA(candles, 12) : [];

    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      candles,
      sma20,
      ema12,
      minPrice,
      maxPrice,
    };
  }, [candles, showSMA, showEMA]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, width, height);

    const { candles: candleData, sma20, ema12, minPrice, maxPrice } = chartData;
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.1;
    const adjustedMin = minPrice - pricePadding;
    const adjustedMax = maxPrice + pricePadding;
    const adjustedRange = adjustedMax - adjustedMin;

    const candleCount = candleData.length;
    const candleWidth = Math.max(3, Math.min(12, chartWidth / candleCount - 2));
    const spacing = chartWidth / candleCount;

    // Helper function to convert price to Y coordinate
    const priceToY = (price: number) => {
      return padding.top + chartHeight - ((price - adjustedMin) / adjustedRange) * chartHeight;
    };

    // Helper function to convert index to X coordinate
    const indexToX = (index: number) => {
      return padding.left + spacing * index + spacing / 2;
    };

    // Draw grid lines
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = adjustedMax - (adjustedRange / gridLines) * i;
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), width - padding.right + 5, y + 4);
    }
    ctx.setLineDash([]);

    // Draw candlesticks
    candleData.forEach((candle, i) => {
      const x = indexToX(i);
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);

      const isGreen = candle.close >= candle.open;
      const color = isGreen ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';

      // Draw wick (high-low line)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body (open-close rectangle)
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
      
      ctx.fillRect(
        x - candleWidth / 2,
        bodyTop,
        candleWidth,
        bodyHeight
      );

      // Add border for hollow candles (optional, for green candles)
      if (isGreen) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          x - candleWidth / 2,
          bodyTop,
          candleWidth,
          bodyHeight
        );
      }
    });

    // Draw SMA line
    if (showSMA && sma20.length > 0) {
      ctx.strokeStyle = 'hsl(var(--volt))';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      sma20.forEach((value, i) => {
        if (value !== null && value !== undefined) {
          const x = indexToX(i);
          const y = priceToY(value);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw EMA line
    if (showEMA && ema12.length > 0) {
      ctx.strokeStyle = 'hsl(var(--volt-accent))';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      ema12.forEach((value, i) => {
        if (value !== null && value !== undefined) {
          const x = indexToX(i);
          const y = priceToY(value);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw time labels
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    const labelInterval = Math.max(1, Math.floor(candleCount / 6));
    candleData.forEach((candle, i) => {
      if (i % labelInterval === 0 || i === candleCount - 1) {
        const x = indexToX(i);
        const time = new Date(candle.time).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        ctx.fillText(time, x, height - 10);
      }
    });

  }, [chartData, showSMA, showEMA]);

  if (candles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
}
