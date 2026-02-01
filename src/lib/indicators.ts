import type { Candle } from '@/hooks/useDerivWebSocket';

// Simple Moving Average
export function calculateSMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push(sum / period);
  }
  
  return result;
}

// Exponential Moving Average
export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for first value
  let prevEMA: number | null = null;
  
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    
    if (prevEMA === null) {
      // Calculate SMA for first EMA value
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      prevEMA = sum / period;
    } else {
      prevEMA = (candles[i].close - prevEMA) * multiplier + prevEMA;
    }
    
    result.push(prevEMA);
  }
  
  return result;
}

// Relative Strength Index
export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  
  if (candles.length < period + 1) {
    return candles.map(() => null);
  }
  
  const changes: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // First average
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  avgGain /= period;
  avgLoss /= period;
  
  result.push(null); // First candle has no change
  for (let i = 0; i < period; i++) {
    result.push(null);
  }
  
  // Calculate RSI
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - (100 / (1 + rs)));
  
  // Subsequent values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const newRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + newRs)));
  }
  
  return result;
}

// MACD (Moving Average Convergence Divergence)
export interface MACDResult {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);
  
  const macdLine: (number | null)[] = fastEMA.map((fast, i) => {
    const slow = slowEMA[i];
    if (fast === null || slow === null) return null;
    return fast - slow;
  });
  
  // Calculate signal line (EMA of MACD)
  const validMacd = macdLine.filter((v): v is number => v !== null);
  const signalMultiplier = 2 / (signalPeriod + 1);
  
  const result: MACDResult[] = [];
  let prevSignal: number | null = null;
  let validCount = 0;
  
  for (let i = 0; i < macdLine.length; i++) {
    const macd = macdLine[i];
    
    if (macd === null) {
      result.push({ macd: null, signal: null, histogram: null });
      continue;
    }
    
    validCount++;
    
    if (validCount < signalPeriod) {
      result.push({ macd, signal: null, histogram: null });
      continue;
    }
    
    if (prevSignal === null) {
      // First signal is SMA of MACD
      let sum = 0;
      let count = 0;
      for (let j = i; j >= 0 && count < signalPeriod; j--) {
        if (macdLine[j] !== null) {
          sum += macdLine[j]!;
          count++;
        }
      }
      prevSignal = sum / signalPeriod;
    } else {
      prevSignal = (macd - prevSignal) * signalMultiplier + prevSignal;
    }
    
    const histogram = macd - prevSignal;
    result.push({ macd, signal: prevSignal, histogram });
  }
  
  return result;
}
