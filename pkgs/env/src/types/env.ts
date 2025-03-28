export type Env = Record<string, unknown> & {
  [key: string]: any;
  isDevelopment: boolean;
  isProduction: boolean;
};
