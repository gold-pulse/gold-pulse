// Deriv API Configuration
export const DERIV_CONFIG = {
  APP_ID: '124475',
  WS_URL: 'wss://ws.derivws.com/websockets/v3',
};

// Full WebSocket URL with app_id
export const DERIV_WS_URL = `${DERIV_CONFIG.WS_URL}?app_id=${DERIV_CONFIG.APP_ID}`;

// OAuth URL
export const DERIV_OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_CONFIG.APP_ID}`;
