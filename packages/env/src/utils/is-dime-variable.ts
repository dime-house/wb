import { DIME_VARIABLES_REGEX } from '../constants/dime-variables';

export const isDimeVariable = (key: string): boolean => {
  if (key.endsWith('_FILE')) {
    key = key.slice(0, -5);
  }

  return DIME_VARIABLES_REGEX.some((regex) => regex.test(key));
};
