import { isIn } from '@dime/utils';
import { existsSync } from 'node:fs';
import { getFileExtension } from './utils/get-file-extension';
import { readConfigurationFromDotEnv } from './utils/read-configuration-from-dotenv';
import { readConfigurationFromYaml } from './read-configuration-from-yaml';

export const readConfigurationFromFile = (path: string) => {
  if (existsSync(path) === false) {
    return null;
  }

  const ext = getFileExtension(path);

  if (isIn(ext, ['yaml', 'yml'] as const)) {
    return readConfigurationFromYaml(path);
  }

  return readConfigurationFromDotEnv(path);
};
