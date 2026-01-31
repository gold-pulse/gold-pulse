import { useState, useEffect, useCallback, useRef } from 'react';

interface VolatilityPriceState {
  price: number | null;
  previousPrice: number | null;
  lastUpdated: Date | null;
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  error: string | null;
}

export function useVolatilityPrice() {
  const [state, setState] = useState<VolatilityPriceState>({
    price: null,
    previousPrice: null,
    lastUpdated: null,
    status: 'connecting',
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, status: 'connecting', error: null }));

    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    wsRef.current = ws;

    ws.onopen = () => {
      setState(prev => ({ ...prev, status: 'connected' }));
      ws.send(JSON.stringify({
        ticks: "R_25",
        subscribe: 1
      }));
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        
        if (data.tick) {
          const newPrice = data.tick.quote;
          const time = new Date(data.tick.epoch * 1000);
          
          setState(prev => ({
            ...prev,
            previousPrice: prev.price,
            price: newPrice,
            lastUpdated: time,
            status: 'connected',
          }));
        }
        
        if (data.error) {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: data.error.message || 'Unknown error',
          }));
        }
      } catch {
        console.error('Failed to parse message');
      }
    };

    ws.onerror = () => {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Connection error',
      }));
    };

    ws.onclose = () => {
      setState(prev => ({ ...prev, status: 'disconnected' }));
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, []);

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

  const priceDirection = state.previousPrice !== null && state.price !== null
    ? state.price > state.previousPrice ? 'up' : state.price < state.previousPrice ? 'down' : 'same'
    : 'same';

  return {
    ...state,
    priceDirection,
    reconnect: connect,
  };
}
