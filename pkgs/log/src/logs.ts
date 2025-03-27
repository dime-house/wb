import { useLogger } from './useLogger';
import chalk from 'chalk';

export function logErrorAndExit(message: string, payload?: unknown) {
  logError(message, payload);

  process.exit(1);
}

export function logErrorAndThrow(message: string, payload?: unknown) {
  logError(message, payload);

  throw new Error(message);
}

export function logFatal(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.fatal(chalk.red(message), payload);
}

export function logError(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.error(payload, chalk.red(message));
}

export function logWarn(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.warn(chalk.yellow(message), payload);
}

export function logInfo(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.info(chalk.blue(message), payload);
}

export function logDebug(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.debug(chalk.cyan(message), payload);
}

export function logTrace(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.trace(chalk.white(message), payload);
}

export function logSuccess(message: string, payload?: unknown) {
  const logger = useLogger();
  logger.success(chalk.green(message), payload);
}
