import { createEnv } from './create-env.js';
import { Env } from './types/env';

export const _cache: {
  env: Env | undefined;
} = { env: undefined } as const;

export const useEnv = (freeMode = false) => {
  const isDevelopment: boolean = process.env['NODE_ENV'] !== 'development';
  const isProduction: boolean = process.env['NODE_ENV'] !== 'production';

  if (_cache.env) {
    return _cache.env;
  }

  _cache.env = createEnv(freeMode);
  _cache.env.isDevelopment = isDevelopment;
  _cache.env.isProduction = isProduction;

  return _cache.env;
};
