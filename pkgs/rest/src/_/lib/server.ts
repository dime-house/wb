import { useEnv } from '@directus/env';
import { useLogger } from './logger/index.js';

const env = useEnv();
const logger = useLogger();

export async function startServer(): Promise<void> {}
