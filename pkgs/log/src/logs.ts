import { useLogger } from './useLogger';
import chalk from 'chalk';

export function logErrorAndExit(error: string | Error, payload?: unknown) {
  logError(error, payload);

  process.exit(1);
}

export function logErrorAndThrow(error: string | Error, payload?: unknown) {
  logError(error, payload);

  if (error instanceof Error) throw new Error(error.message);
}

export function logFatal(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.fatal(chalk.red(error), payload);
}

export function logError(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.error(payload, chalk.red(error));
}

export function logWarn(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.warn(chalk.yellow(error), payload);
}

export function logInfo(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.info(chalk.blue(error), payload);
}

export function logDebug(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.debug(chalk.cyan(error), payload);
}

export function logTrace(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.trace(chalk.white(error), payload);
}

export function logSuccess(error: string | Error, payload?: unknown) {
  const logger = useLogger();
  logger.success(chalk.green(error), payload);
}
