import type { UnknownObject } from '@dime/type';

export function isObject(input: unknown): input is UnknownObject {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
