import { type Logger, pino } from 'pino';
import pinoPretty from 'pino-pretty';

let _cache: Logger<'success'>;

const level = process.env['log_level'] || 'trace';
const pinoOptions = { level, customLevels: { success: 20 } };

export const useLogger = () => {
  if (_cache) {
    return _cache;
  }

  _cache = pino(
    pinoOptions,
    pino.multistream([
      {
        level,
        stream: pinoPretty({
          ignore: 'hostname,pid,level',
          sync: true,
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          customLevels: pinoOptions.customLevels,
        }),
      },
    ])
  );

  return _cache;
};
