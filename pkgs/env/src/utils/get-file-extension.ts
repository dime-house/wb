import { extname } from 'node:path';

export const getFileExtension = (path: string) => {
  return extname(path).toLowerCase().substring(1);
};
