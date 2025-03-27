import { parseJSON } from '@wb/utils';

export const tryJson = (value: unknown) => {
  try {
    return parseJSON(String(value)) as unknown;
  } catch {
    return value;
  }
};
