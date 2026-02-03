// Deriv API configuration and helpers
export const DERIV_APP_ID = '124475'; // User's app ID
export const DERIV_WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`;

// OAuth URLs
export const DERIV_OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_APP_ID}`;

// Market symbols
export const VOLATILITY_INDICES = [
  { symbol: 'R_10', name: 'Volatility 10 Index', shortName: 'V10' },
  { symbol: 'R_25', name: 'Volatility 25 Index', shortName: 'V25' },
  { symbol: 'R_50', name: 'Volatility 50 Index', shortName: 'V50' },
  { symbol: 'R_75', name: 'Volatility 75 Index', shortName: 'V75' },
  { symbol: 'R_100', name: 'Volatility 100 Index', shortName: 'V100' },
  { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', shortName: 'V10 1s' },
  { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', shortName: 'V25 1s' },
  { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', shortName: 'V50 1s' },
  { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', shortName: 'V75 1s' },
  { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', shortName: 'V100 1s' },
] as const;

export const FOREX_PAIRS = [
  { symbol: 'frxXAUUSD', name: 'Gold/USD', shortName: 'XAU/USD' },
  { symbol: 'frxXAGUSD', name: 'Silver/USD', shortName: 'XAG/USD' },
  { symbol: 'frxEURUSD', name: 'EUR/USD', shortName: 'EUR/USD' },
  { symbol: 'frxGBPUSD', name: 'GBP/USD', shortName: 'GBP/USD' },
  { symbol: 'frxUSDJPY', name: 'USD/JPY', shortName: 'USD/JPY' },
  { symbol: 'frxAUDUSD', name: 'AUD/USD', shortName: 'AUD/USD' },
  { symbol: 'frxUSDCAD', name: 'USD/CAD', shortName: 'USD/CAD' },
  { symbol: 'frxUSDCHF', name: 'USD/CHF', shortName: 'USD/CHF' },
] as const;

export type MarketType = 'volatility' | 'forex';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export const TIMEFRAMES: { value: Timeframe; label: string; seconds: number }[] = [
  { value: '1m', label: '1M', seconds: 60 },
  { value: '5m', label: '5M', seconds: 300 },
  { value: '15m', label: '15M', seconds: 900 },
  { value: '1h', label: '1H', seconds: 3600 },
  { value: '4h', label: '4H', seconds: 14400 },
  { value: '1d', label: '1D', seconds: 86400 },
];

export function getMarketSymbols(marketType: MarketType) {
  return marketType === 'volatility' ? VOLATILITY_INDICES : FOREX_PAIRS;
}

// Parse OAuth callback tokens
export function parseDerivOAuthCallback(urlParams: URLSearchParams) {
  const accounts: { account: string; token: string; currency: string }[] = [];
  let i = 1;
  
  while (urlParams.has(`acct${i}`)) {
    accounts.push({
      account: urlParams.get(`acct${i}`) || '',
      token: urlParams.get(`token${i}`) || '',
      currency: urlParams.get(`cur${i}`) || '',
    });
    i++;
  }
  
  return accounts;
}
