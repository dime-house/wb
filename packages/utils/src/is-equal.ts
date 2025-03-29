import type { Item } from '@dime/type';

/**
 * Сравнивает два значения на глубокое равенство.
 *
 * @param actual Первое сравниваемое значение.
 * @param expected Второе сравниваемое значение.
 * @returns Возвращает `true`, если значения равны (по логике глубокого сравнения),
 *   и `false` в противном случае.
 */
export function isEqual<T>(actual: any, expected: T): actual is T {
  if (actual === expected) return true;

  // Проверяем, что оба значения — объекты (и не null), иначе переходим к проверке NaN
  if (
    actual &&
    expected &&
    typeof actual === 'object' &&
    typeof expected === 'object'
  ) {
    // Сравниваем конструкторы, если они различаются — объекты точно разные
    if (actual.constructor !== expected.constructor) return false;

    let length: number;
    let i: any;
    let keys: string[];

    // Если массивы
    if (Array.isArray(actual) && Array.isArray(expected)) {
      length = actual.length;
      if (length !== expected.length) return false;

      for (i = length; i-- !== 0; ) {
        if (!isEqual(actual[i], expected[i])) return false;
      }

      return true;
    }

    // Если Map
    if (actual instanceof Map && expected instanceof Map) {
      if (actual.size !== expected.size) return false;

      // Проверяем, что все ключи из `actual` есть в `expected`
      for (const entry of actual.entries()) {
        if (!expected.has(entry[0])) return false;
      }

      // Проверяем, что значения совпадают
      for (const entry of actual.entries()) {
        if (!isEqual(entry[1], expected.get(entry[0]))) return false;
      }

      return true;
    }

    // Если Set
    if (actual instanceof Set && expected instanceof Set) {
      if (actual.size !== expected.size) return false;

      // Проверяем, что все элементы из `actual` есть в `expected`
      for (const entry of actual.entries()) {
        if (!expected.has(entry[0])) return false;
      }

      return true;
    }

    // Если типизированные массивы (например, Int8Array и т. п.)
    if (ArrayBuffer.isView(actual) && ArrayBuffer.isView(expected)) {
      // Любой типизированный массив имеет свойство .length
      const typedA = actual as unknown as ArrayLike<number>;
      const typedB = expected as unknown as ArrayLike<number>;

      length = typedA.length;
      if (length !== typedB.length) return false;

      for (i = length; i-- !== 0; ) {
        if (typedA[i] !== typedB[i]) return false;
      }

      return true;
    }

    // Если объекты типа RegExp
    if (actual instanceof RegExp && expected instanceof RegExp) {
      return (
        actual.source === expected.source && actual.flags === expected.flags
      );
    }

    // Сравниваем результат valueOf, если он переопределён
    if (actual.valueOf !== Object.prototype.valueOf) {
      return actual.valueOf() === expected.valueOf();
    }

    // Сравниваем результат toString, если он переопределён
    if (actual.toString !== Object.prototype.toString) {
      return actual.toString() === expected.toString();
    }

    // Сравниваем ключи
    keys = Object.keys(actual);
    length = keys.length;
    if (length !== Object.keys(expected).length) return false;

    // Проверяем, что во втором объекте есть все ключи первого
    for (i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(expected, keys[i]!)) {
        return false;
      }
    }

    // Рекурсивно сравниваем значения по ключам
    for (i = length; i-- !== 0; ) {
      const key = keys[i]!;

      if (!isEqual((actual as Item)[key], (expected as Item)[key])) {
        return false;
      }
    }

    return true;
  }

  // Проверяем случай, когда actual и expected — NaN (NaN !== NaN по стандарту)
  return actual !== actual && expected !== expected;
}
