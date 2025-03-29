import { posix, relative, sep } from 'path';

export function pathToRelativeUrl(filePath: string, root = '.') {
	return relative(root, filePath).split(sep).join(posix.sep);
}
