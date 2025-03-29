/**
 * Функция, которая применяется к каждому элементу массива с доступом к соседним элементам и индексу.
 *
 * @template T - Тип элементов массива.
 * @template U - Тип возвращаемого значения.
 *
 * @param {T} current - Текущий элемент массива.
 * @param {T | undefined} next - Следующий элемент массива, если он существует.
 * @param {T | undefined} previous - Предыдущий элемент массива, если он существует.
 * @param {number} [index] - Индекс текущего элемента массива.
 * @returns {U} Результат преобразования.
 */
type NeighborsIteratee<T, U> = (current: T, next?: T, previous?: T, index?: number) => U;

/**
 * Функция, которая выполняется для каждого элемента массива с доступом к соседним элементам и индексу.
 *
 * @template T - Тип элементов массива.
 *
 * @param {T} current - Текущий элемент массива.
 * @param {T | undefined} next - Следующий элемент массива, если он существует.
 * @param {T | undefined} previous - Предыдущий элемент массива, если он существует.
 * @param {number} [index] - Индекс текущего элемента массива.
 */
type NeighborsCallback<T> = (current: T, next?: T, previous?: T, index?: number) => void;

/**
 * Получает текущий, следующий и предыдущий элементы массива для заданного индекса.
 *
 * @template T - Тип элементов массива.
 *
 * @param {T[]} array - Массив элементов.
 * @param {number} index - Текущий индекс.
 * @returns {{ current: T; next?: T; previous?: T }} Объект с текущим, следующим и предыдущим элементами.
 */
function getNeighbors<T>(array: T[], index: number): { current: T; next: T | undefined; previous: T | undefined } {
	const current = array[index] as T;
	const previous = index > 0 ? array[index - 1] : undefined;
	const next = index < array.length - 1 ? array[index + 1] : undefined;
	return { current, next, previous };
}

/**
 * Применяет функцию преобразования к каждому элементу массива, передавая текущий, следующий и предыдущий элементы.
 *
 * @template T - Тип элементов массива.
 * @template U - Тип возвращаемых элементов.
 *
 * @param {T[]} items - Массив элементов для обработки.
 * @param {NeighborsIteratee<T, U>} iteratee - Функция, которая применяется к каждому элементу массива.
 *
 * @returns {U[]} Новый массив, содержащий результаты применения функции преобразования.
 */
export function mapWithNeighbors<T, U>(items: T[], iteratee: NeighborsIteratee<T, U>): U[] {
	return items.map((_, index) => {
		const { current, next, previous } = getNeighbors(items, index);
		return iteratee(current, next, previous, index);
	});
}

/**
 * Выполняет функцию для каждого элемента массива, передавая текущий, следующий и предыдущий элементы.
 *
 * @template T - Тип элементов массива.
 *
 * @param {T[]} items - Массив элементов для обработки.
 * @param {NeighborsCallback<T>} iteratee - Функция, которая выполняется для каждого элемента массива.
 */
export function forEachWithNeighbors<T>(items: T[], iteratee: NeighborsCallback<T>): void {
	items.forEach((_, index) => {
		const { current, next, previous } = getNeighbors(items, index);
		iteratee(current, next, previous, index);
	});
}
