import { isPayPalConfigured, type AppConfig } from '../config.js';
import { createDemoPayPalClient } from './demoClient.js';
import { createLivePayPalClient } from './liveClient.js';
import type { PayPalClient } from './types.js';

export function createPayPalClient(config: AppConfig, fetchImpl?: typeof fetch): PayPalClient {
  if (!isPayPalConfigured(config)) return createDemoPayPalClient();
  return createLivePayPalClient(config, fetchImpl);
}
