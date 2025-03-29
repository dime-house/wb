/**
 * Делает первый символ строки заглавным.
 *
 * @param {string} str - Исходная строка.
 * @return {string} Строка с заглавной первой буквой.
 */
export function capitalizeFirstLetter(str: string): string {
	if (str.length === 0) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}
