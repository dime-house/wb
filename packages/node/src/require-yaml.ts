import { load } from 'js-yaml';
import { readFileSync } from 'node:fs';

export function requireYaml<T>(filepath: string): T {
	const yamlRaw = readFileSync(filepath, 'utf8');
	return load(yamlRaw) as T;
}
