import { WB_VARIABLES_REGEX } from '../constants/directus-variables.js';

export const isWbVariable = (key: string): boolean => {
  if (key.endsWith('_FILE')) {
    key = key.slice(0, -5);
  }

  return WB_VARIABLES_REGEX.some((regex) => regex.test(key));
};
