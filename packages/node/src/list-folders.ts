import fse from 'fs-extra';
import { join, resolve } from 'node:path';

const { readdir, stat } = fse;

interface ListFoldersOptions {
	/**
	 * Ignore folders starting with a period `.`
	 */
	ignoreHidden?: boolean;
}

export async function listFolders(location: string, options?: ListFoldersOptions): Promise<string[]> {
	const fullPath = resolve(location);
	const files = await readdir(fullPath);

	const directories: string[] = [];

	for (const file of files) {
		if (options?.ignoreHidden && file.startsWith('.')) {
			continue;
		}

		const filePath = join(fullPath, file);

		const stats = await stat(filePath);

		if (stats.isDirectory()) {
			directories.push(file);
		}
	}

	return directories;
}
