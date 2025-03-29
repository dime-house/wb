import type { EnvType } from '../types/env-type.js';

export const TYPE_MAP: Record<string, EnvType> = {
  HOST: 'string',
  PORT: 'string',

  SERVER_SHUTDOWN_TIMEOUT: 'number',
} as const;
