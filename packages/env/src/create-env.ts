import { DEFAULTS } from './constants/defaults';
import { Env } from './types/env';
import { readConfigurationFromProcess } from './utils/read-configuration-from-process';
import { readConfigurationFromFile } from './read-configuration-from-file';
import { getConfigPath } from './utils/get-config-path';
import { getDefaultType } from './utils/get-default-type';
import { cast } from './cast';
import { isFileKey } from './utils/is-file-key';
import { readFileSync } from 'node:fs';
import { removeFileSuffix } from './utils/remove-file-suffix';
import { getCastFlag } from './utils/has-cast-prefix';
import { isValidVariable } from './utils/is-directus-variable';

export const createEnv = (freeMode = false): Env => {
  const baseConfiguration = readConfigurationFromProcess();
  const fileConfiguration = readConfigurationFromFile(getConfigPath());

  const rawConfiguration = { ...baseConfiguration, ...fileConfiguration };

  const output: Env = {};

  for (const [key, value] of Object.entries(DEFAULTS)) {
    output[key] = getDefaultType(key) ? cast(value, key) : value;
  }

  for (let [key, value] of Object.entries(rawConfiguration)) {
    if (
      isFileKey(key) &&
      isValidVariable(key) &&
      typeof value === 'string' &&
      freeMode === false
    ) {
      try {
        // get the path to the file
        const castFlag = getCastFlag(value);
        const castPrefix = castFlag ? castFlag + ':' : '';
        const filePath = castFlag ? value.replace(castPrefix, '') : value;

        // read file content
        const fileContent = readFileSync(filePath, { encoding: 'utf8' });

        // override key value pair
        key = removeFileSuffix(key);
        value = castPrefix + fileContent;
      } catch {
        throw new Error(
          `Failed to read value from file "${value}", defined in environment variable "${key}".`
        );
      }
    }

    output[key] = cast(value, key);
  }

  return output;
};
