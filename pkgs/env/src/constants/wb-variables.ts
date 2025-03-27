export const WB_VARIABLES = [
  'CONFIG_PATH',
  'HOST',
  'PORT',
  'PUBLIC_URL',
  'LOG_LEVEL',
] as const;

export const WB_VARIABLES_REGEX = WB_VARIABLES.map(
  (name) => new RegExp(`^${name}$`)
);
