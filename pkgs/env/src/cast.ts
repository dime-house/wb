import { toArray, toBoolean } from '@wb/utils';
import { toNumber, toString } from 'lodash-es';
import { getCastFlag } from './utils/has-cast-prefix';
import { getDefaultType } from './utils/get-default-type';
import { guessType } from './utils/guess-type';
import { tryJson } from './utils/try-json';

export const cast = (value: unknown, key?: string): unknown => {
  const castFlag = getCastFlag(value);

  const type = castFlag ?? getDefaultType(key) ?? guessType(value);

  if (typeof value === 'string' && castFlag) {
    value = value.substring(castFlag.length + 1); // Type length + 1 for `:` character
  }

  switch (type) {
    case 'string':
      return toString(value);
    case 'number':
      return toNumber(value);
    case 'boolean':
      return toBoolean(value);
    case 'regex':
      return new RegExp(String(value));
    case 'array':
      return toArray(value)
        .map((v) => cast(v))
        .filter((v) => v !== '');
    case 'json':
      return tryJson(value);
  }
};
