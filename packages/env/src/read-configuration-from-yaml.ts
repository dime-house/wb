import { isPlainObject } from 'lodash';
import { requireYaml } from '@dime/node';

export const readConfigurationFromYaml = (path: string) => {
  const config = requireYaml(path);

  if (!isPlainObject(config)) {
    throw new Error('YAML configuration file does not contain an object');
  }

  return config as Record<string, unknown>;
};
