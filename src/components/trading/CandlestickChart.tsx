import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pan and zoom state
  const [offset, setOffset] = useState(0); // horizontal pan offset (in candles)
  const [zoom, setZoom] = useState(1); // zoom level
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; offset: number } | null>(null);

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

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, offset };
  }, [offset]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const candleWidth = (containerRef.current?.clientWidth || 800) / (chartData.candles.length * zoom);
    const newOffset = dragStartRef.current.offset + dx / candleWidth;
    
    // Limit panning
    const maxOffset = Math.max(0, chartData.candles.length - 20);
    setOffset(Math.max(-maxOffset, Math.min(maxOffset, newOffset)));
  }, [isDragging, chartData.candles.length, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, offset };
    }
  }, [offset]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const candleWidth = (containerRef.current?.clientWidth || 800) / (chartData.candles.length * zoom);
    const newOffset = dragStartRef.current.offset + dx / candleWidth;
    
    const maxOffset = Math.max(0, chartData.candles.length - 20);
    setOffset(Math.max(-maxOffset, Math.min(maxOffset, newOffset)));
  }, [isDragging, chartData.candles.length, zoom]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

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
    const padding = { top: 20, right: 70, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, width, height);

    const { candles: candleData, sma20, ema12, minPrice, maxPrice } = chartData;
    
    // Calculate visible range based on zoom and offset
    const visibleCandleCount = Math.floor(candleData.length / zoom);
    const startIndex = Math.max(0, Math.floor(candleData.length - visibleCandleCount + offset));
    const endIndex = Math.min(candleData.length, startIndex + visibleCandleCount);
    const visibleCandles = candleData.slice(startIndex, endIndex);
    
    if (visibleCandles.length === 0) return;

    // Calculate price range for visible candles
    const visiblePrices = visibleCandles.flatMap(c => [c.high, c.low]);
    const visibleMin = Math.min(...visiblePrices);
    const visibleMax = Math.max(...visiblePrices);
    const priceRange = visibleMax - visibleMin;
    const pricePadding = priceRange * 0.1;
    const adjustedMin = visibleMin - pricePadding;
    const adjustedMax = visibleMax + pricePadding;
    const adjustedRange = adjustedMax - adjustedMin;

    const candleCount = visibleCandles.length;
    const candleWidth = Math.max(3, Math.min(15, chartWidth / candleCount - 2));
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
    ctx.strokeStyle = 'hsl(220, 15%, 20%)';
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
      ctx.fillStyle = 'hsl(220, 10%, 55%)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), width - padding.right + 5, y + 4);
    }
    ctx.setLineDash([]);

    // Draw candlesticks
    visibleCandles.forEach((candle, i) => {
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

    // Draw current price line
    const currentPrice = candleData[candleData.length - 1]?.close;
    if (currentPrice && currentPrice >= adjustedMin && currentPrice <= adjustedMax) {
      const priceY = priceToY(currentPrice);
      const isUp = candleData[candleData.length - 1].close >= candleData[candleData.length - 1].open;
      const lineColor = isUp ? 'hsl(142, 76%, 45%)' : 'hsl(0, 84%, 60%)';
      
      // Dashed line across chart
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(padding.left, priceY);
      ctx.lineTo(width - padding.right, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label box on right
      ctx.fillStyle = lineColor;
      const labelWidth = 55;
      const labelHeight = 18;
      ctx.fillRect(width - padding.right + 2, priceY - labelHeight / 2, labelWidth, labelHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentPrice.toFixed(2), width - padding.right + 2 + labelWidth / 2, priceY + 4);
    }

    // Draw SMA line
    if (showSMA && sma20.length > 0) {
      ctx.strokeStyle = 'hsl(220, 90%, 56%)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      sma20.slice(startIndex, endIndex).forEach((value, i) => {
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
      ctx.strokeStyle = 'hsl(260, 85%, 60%)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      ema12.slice(startIndex, endIndex).forEach((value, i) => {
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
    ctx.fillStyle = 'hsl(220, 10%, 55%)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    const labelInterval = Math.max(1, Math.floor(candleCount / 6));
    visibleCandles.forEach((candle, i) => {
      if (i % labelInterval === 0 || i === candleCount - 1) {
        const x = indexToX(i);
        const time = new Date(candle.time).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        ctx.fillText(time, x, height - 10);
      }
    });

  }, [chartData, showSMA, showEMA, zoom, offset]);

  // Reset zoom and offset when candles change significantly
  useEffect(() => {
    setOffset(0);
  }, [candles.length > 0 ? candles[0].time : 0]);

  if (candles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div 
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
      
      {/* Zoom controls */}
      <div className="absolute bottom-2 right-16 flex items-center gap-1 rounded-lg border border-border/50 bg-card/90 px-2 py-1 text-xs backdrop-blur">
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
          className="px-2 py-1 hover:text-volt"
        >
          −
        </button>
        <span className="min-w-[40px] text-center text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
          className="px-2 py-1 hover:text-volt"
        >
          +
        </button>
        <button
          onClick={() => { setZoom(1); setOffset(0); }}
          className="ml-1 px-2 py-1 text-muted-foreground hover:text-volt"
          title="Reset view"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
