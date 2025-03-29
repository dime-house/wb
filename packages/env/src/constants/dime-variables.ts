export const DIME_VARIABLES = [
  'CONFIG_PATH',
  'HOST',
  'PORT',
  'PUBLIC_URL',
  'LOG_LEVEL',
] as const;

export const DIME_VARIABLES_REGEX = DIME_VARIABLES.map(
  (name) => new RegExp(`^${name}$`)
);
