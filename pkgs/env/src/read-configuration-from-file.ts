import { isIn } from '@wb/utils';
import { existsSync } from 'node:fs';
import { getFileExtension } from '../utils/get-file-extension.js';
import { readConfigurationFromDotEnv } from '../utils/read-configuration-from-dotenv.js';
import { readConfigurationFromJson } from '../utils/read-configuration-from-json.js';
import { readConfigurationFromYaml } from '../utils/read-configuration-from-yaml.js';

export const readConfigurationFromFile = (path: string) => {
  if (existsSync(path) === false) {
    return null;
  }

  const ext = getFileExtension(path);

  if (ext === 'json') {
    return readConfigurationFromJson(path);
  }

  if (isIn(ext, ['yaml', 'yml'] as const)) {
    return readConfigurationFromYaml(path);
  }

  return readConfigurationFromDotEnv(path);
};
