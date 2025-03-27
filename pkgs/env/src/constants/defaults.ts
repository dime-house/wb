import { resolve } from 'node:path';
import { cwd } from 'node:process';

export const DEFAULTS = {
  CONFIG_PATH: resolve(cwd(), '.env'),

  HOST: '0.0.0.0',
  PORT: 5000,
  PUBLIC_URL: '/',
  SERVER_SHUTDOWN_TIMEOUT: 1000,
} as const;
