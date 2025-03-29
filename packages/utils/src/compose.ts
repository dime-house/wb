import { isObject } from './is-object.js';

/**
 * Пустая функция, которая не выполняет никаких действий.
 * Используется в качестве заглушки.
 */
export const NOOP = () => {};

/**
 * Проверяет, изменилось ли значение.
 *
 * @param value Новое значение.
 * @param oldValue Старое значение.
 * @returns `true`, если значения различны.
 */
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

/**
 * Проверяет, является ли переданный объект `Promise`.
 *
 * @template T Тип значения, которое возвращает `Promise`.
 * @param val Проверяемое значение.
 * @returns `true`, если значение является объектом `Promise`.
 */
export const isPromise = <T>(val: unknown): val is Promise<T> => {
	return isObject(val) && isFunction(val['then']) && isFunction(val['catch']);
};

const objectToString = Object.prototype.toString;

/**
 * Возвращает строковое представление типа значения.
 *
 * @param value Проверяемое значение.
 * @returns Строковое представление типа значения.
 */
export const toTypeString = (value: unknown): string => objectToString.call(value);

/**
 * Проверяет, является ли значение объектом `Map`.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является `Map`.
 */
export const isMap = (val: unknown): val is Map<any, any> => toTypeString(val) === '[object Map]';

/**
 * Проверяет, является ли значение объектом `Set`.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является `Set`.
 */
export const isSet = (val: unknown): val is Set<any> => toTypeString(val) === '[object Set]';

/**
 * Проверяет, является ли значение объектом `Date`.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является `Date`.
 */
export const isDate = (val: unknown): val is Date => toTypeString(val) === '[object Date]';

/**
 * Проверяет, является ли значение объектом `RegExp`.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является `RegExp`.
 */
export const isRegExp = (val: unknown): val is RegExp => toTypeString(val) === '[object RegExp]';

/**
 * Проверяет, является ли значение функцией.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является функцией.
 */
export const isFunction = (val: unknown): val is Function => typeof val === 'function';

/**
 * Проверяет, является ли значение строкой.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является строкой.
 */
export const isString = (val: unknown): val is string => typeof val === 'string';

/**
 * Проверяет, является ли значение символом.
 *
 * @param val Проверяемое значение.
 * @returns `true`, если значение является символом.
 */
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';

/**
 * Проверяет, является ли переданная функция классом.
 *
 * @param fn Проверяемая функция.
 * @returns `true`, если значение является классом.
 */
export const isClass = (fn: any): boolean => /^\s*class/.test(fn.toString());

/**
 * Проверяет, является ли объект обычным объектом (`Plain Object`).
 *
 * @param value Проверяемое значение.
 * @returns `true`, если объект является обычным объектом.
 */
export function isPlainObject(value: any): boolean {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);

	if (prototype === null) {
		return true;
	}

	const constructor = prototype.constructor;
	return (
		typeof constructor === 'function' &&
		constructor instanceof constructor &&
		Function.prototype.toString.call(constructor) === Function.prototype.toString.call(Object)
	);
}

/**
 * Рекурсивно объединяет объекты.
 *
 * @param target Целевой объект, в который вносятся изменения.
 * @param sources Источники данных для объединения.
 * @returns Объединённый объект.
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 } };
 * merge(obj1, obj2); // { a: 1, b: { c: 2, d: 3 } }
 */
export function merge(target: any, ...sources: any[]) {
	if (!sources.length) return target;

	for (const source of sources) {
		if (!isObject(source)) continue;

		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				const sourceValue = source[key];
				const targetValue = target[key];

				if (Array.isArray(sourceValue)) {
					if (Array.isArray(targetValue)) {
						target[key] = mergeArrays(targetValue, sourceValue);
					} else {
						target[key] = sourceValue.slice();
					}
				} else if (isObject(sourceValue)) {
					if (isObject(targetValue)) {
						target[key] = merge(targetValue, sourceValue);
					} else {
						target[key] = merge({}, sourceValue);
					}
				} else {
					target[key] = sourceValue;
				}
			}
		}
	}

	return target;
}

/**
 * Рекурсивно объединяет массивы.
 *
 * @template T Тип элементов массива.
 * @param targetArray Целевой массив.
 * @param sourceArray Источник данных для объединения.
 * @returns Объединённый массив.
 *
 * @example
 * const arr1 = [{ a: 1 }, { b: 2 }];
 * const arr2 = [{ a: 3 }, { c: 4 }];
 * mergeArrays(arr1, arr2); // [{ a: 3 }, { b: 2, c: 4 }]
 */
export function mergeArrays<T>(targetArray: Array<T>, sourceArray: Array<T>): Array<T> {
	const result = targetArray.slice();

	sourceArray.forEach((item, index) => {
		if (isObject(item)) {
			if (isObject(result[index])) {
				result[index] = merge(result[index], item);
			} else {
				result[index] = merge({}, item);
			}
		} else {
			result[index] = item;
		}
	});

	return result;
}

/**
 * Проверяет, пуст ли объект, массив, строка, Map, Set и т.д.
 *
 * @param obj Проверяемый объект
 * @returns Возвращает true, если объект пустой, иначе false
 */
export function isObjectEmpty(obj: any): boolean {
	if (obj == null) return true; // null или undefined считаются пустыми

	if (typeof obj === 'string' || Array.isArray(obj)) {
		return obj.length === 0;
	}

	if (obj instanceof Map || obj instanceof Set) {
		return obj.size === 0;
	}

	if (typeof obj === 'object') {
		return Object.keys(obj).length === 0;
	}

	return false;
}

/**
 * Проверяет, является ли значение пустым.
 * Пустым считается:
 * - Число, которое является NaN
 * - Пустой объект, массив, строка, Map, Set и т.д.
 *
 * @param value Проверяемое значение
 * @returns Возвращает true, если значение пустое, иначе false
 */
export function isEmpty(value: any): boolean {
	if (typeof value === 'number') {
		return Number.isNaN(value);
	}

	return isObjectEmpty(value);
}
