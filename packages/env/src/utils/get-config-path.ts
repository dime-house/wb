import { resolve } from 'node:path';
import { DEFAULTS } from '../constants/defaults.js';

export const getConfigPath = () => {
  const path = process.env['CONFIG_PATH'] || DEFAULTS.CONFIG_PATH;
  return resolve(path);
};
