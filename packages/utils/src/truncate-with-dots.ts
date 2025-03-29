/**
 * Обрезает строку, добавляя точки, если она превышает указанную максимальную длину.
 *
 * @param {string} str - Строка для обрезки.
 * @param {number} maxLength - Максимальная длина строки перед обрезкой.
 *
 * @return {string} Обрезанная строка с добавленными точками, если это необходимо.
 */
export function truncateWithDots(str: string, maxLength: number): string {
	if (str.length > maxLength) {
		return str.substring(0, maxLength) + '...';
	} else {
		return str;
	}
}
