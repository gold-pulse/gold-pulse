import { useState, useEffect, useCallback, useRef } from 'react';
import { DERIV_WS_URL, Timeframe } from '@/lib/deriv';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TickData {
  price: number;
  time: Date;
  previousPrice: number | null;
}

interface UseDerivWebSocketOptions {
  symbol: string;
  timeframe?: Timeframe;
  token?: string;
}

export function useDerivWebSocket({ symbol, timeframe = '1m', token }: UseDerivWebSocketOptions) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [tick, setTick] = useState<TickData | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);

  const getGranularity = useCallback((tf: Timeframe): number => {
    const map: Record<Timeframe, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    return map[tf];
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setStatus('connecting');
    setError(null);

    const ws = new WebSocket(DERIV_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      
      // Authorize if token provided
      if (token) {
        ws.send(JSON.stringify({ authorize: token }));
      }

      // Request candle history
      const granularity = getGranularity(timeframe);
      ws.send(JSON.stringify({
        ticks_history: symbol,
        adjust_start_time: 1,
        count: 100,
        end: 'latest',
        granularity,
        style: 'candles',
        subscribe: 1,
      }));

      // Subscribe to live ticks
      ws.send(JSON.stringify({
        ticks: symbol,
        subscribe: 1,
      }));
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        // Handle authorization response
        if (data.authorize) {
          setBalance(data.authorize.balance);
        }

        // Handle balance updates
        if (data.balance) {
          setBalance(data.balance.balance);
        }

        // Handle candle history
        if (data.candles) {
          const historicalCandles: Candle[] = data.candles.map((c: any) => ({
            time: c.epoch * 1000,
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close),
          }));
          setCandles(historicalCandles);
        }

        // Handle OHLC updates
        if (data.ohlc) {
          const newCandle: Candle = {
            time: data.ohlc.epoch * 1000,
            open: parseFloat(data.ohlc.open),
            high: parseFloat(data.ohlc.high),
            low: parseFloat(data.ohlc.low),
            close: parseFloat(data.ohlc.close),
          };

          setCandles(prev => {
            const lastCandle = prev[prev.length - 1];
            if (lastCandle && lastCandle.time === newCandle.time) {
              // Update existing candle
              return [...prev.slice(0, -1), newCandle];
            } else if (!lastCandle || newCandle.time > lastCandle.time) {
              // Add new candle
              return [...prev.slice(-99), newCandle];
            }
            return prev;
          });
        }

        // Handle tick updates
        if (data.tick) {
          const newPrice = data.tick.quote;
          const time = new Date(data.tick.epoch * 1000);

          setTick(prev => ({
            price: newPrice,
            time,
            previousPrice: prev?.price ?? null,
          }));
        }

        // Handle subscription confirmation
        if (data.subscription) {
          subscriptionIdRef.current = data.subscription.id;
        }

        // Handle errors
        if (data.error) {
          console.error('Deriv WS Error:', data.error);
          setError(data.error.message);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setError('Connection error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [symbol, timeframe, token, getGranularity]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const priceDirection = tick?.previousPrice !== null && tick?.price !== undefined
    ? tick.price > (tick.previousPrice ?? 0) ? 'up' : tick.price < (tick.previousPrice ?? 0) ? 'down' : 'same'
    : 'same';

  return {
    candles,
    tick,
    balance,
    status,
    error,
    priceDirection,
    reconnect: connect,
  };
}
