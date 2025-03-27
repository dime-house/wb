#!/usr/bin/env node
import { createFastifyLogger, logError } from '@centrem/logger';
import cors from '@fastify/cors';
import { Command } from 'commander';
import Fastify, { FastifyInstance, HTTPMethods } from 'fastify';
import { readdir, readFile } from 'fs/promises';
import { resolve } from 'path';

const program = new Command();

program
	.version('1.0.0')
	.description('Строит API эндпоинты на основе метаописания в мок файле')
	.argument('[directory]', 'Директория с JSON файлами', process.cwd())
	.option('-p, --port <port>', 'Порт для прослушивания', process.env['port'] || '5005')
	.option('-h, --host <host>', 'Хост для прослушивания', process.env['host'] || '127.0.0.1')
	.parse(process.argv);

const options = program.opts();
const args = program.args;

const dir: string = Array.isArray(args) && args.length > 0 ? (args[0] as string) : process.cwd();

type RouteConfig = { method: HTTPMethods; url: string; body?: unknown };

async function serveStatic(dir: string): Promise<FastifyInstance> {
	const app = Fastify({
		loggerInstance: createFastifyLogger(),
	}).register(cors);

	for (const { url, body, method } of await fetchEndpoints(dir)) {
		try {
			app.route({
				method,
				url,
				handler: () => body,
				logLevel: 'trace',
			});

			app.log.info(`Создан маршрут: ${url}`);
		} catch (error: any) {
			app.log.error(error.message, error);
		}
	}

	return app as unknown as FastifyInstance;
}

async function fetchEndpoints(dir: string): Promise<Array<RouteConfig>> {
	const filePaths: string[] = await readDir(dir);

	const endpoints = await Promise.all(
		filePaths
			.filter((path) => !path.includes('node_modules'))
			.map(async (file): Promise<RouteConfig | null> => {
				try {
					const content = await readFile(file, 'utf8');
					const jsonData = JSON.parse(content) as RouteConfig;

					if (jsonData.url) {
						return jsonData;
					} else {
						return null;
					}
				} catch (error: any) {
					logError(`Ошибка чтения файла ${file}: ${error.message}`);
					return null;
				}
			}),
	);

	return endpoints.filter(Boolean) as RouteConfig[];
}

async function readDir(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });

	const files: string[][] = await Promise.all(
		entries.map(async (entry): Promise<string[]> => {
			const res = resolve(dir, entry.name);

			if (entry.isDirectory()) {
				return await readDir(res);
			} else if (entry.name.endsWith('.json')) {
				return [res];
			} else {
				return [];
			}
		}),
	);

	return files.flat();
}

// Запуск сервера
try {
	const app = await serveStatic(dir);

	await app.listen({
		listenTextResolver: (address: string) => {
			return `Сервер запущен на ${address}`;
		},
		port: parseInt(options['port'], 10),
		host: options['host'],
	});
} catch (err) {
	logError('Ошибка запуска сервера:', err);
}
