import { DERIV_CONFIG } from '@/config/deriv';

// Connect to Deriv WebSocket
const ws = new WebSocket(`${DERIV_CONFIG.WS_URL}?app_id=124475`);

