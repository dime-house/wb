import type { DeepPartial } from '@dime/type';
import { assignPartial } from './assign-partial.js';

/**
 * Базовый класс массива, предоставляющий дополнительные методы работы с элементами.
 * @template S Тип элемента, который должен наследоваться от BaseItem.
 */
export class BaseArray<S extends BaseItem<S>> extends Array<S> {
  /**
   * Создает новый экземпляр BaseArray из массива элементов типа T.
   *
   * @template T Тип элементов входного массива.
   * @template S Результирующий тип экземпляра BaseArray.
   * @param items Массив элементов типа T.
   * @returns Новый экземпляр BaseArray, содержащий переданные элементы.
   */
  static ofArray<T, S = T>(this: new (...items: T[]) => S, items: T[]): S {
    return new this(...items);
  }

  /**
   * Возвращает пустой экземпляр BaseArray.
   *
   * @template T Тип элементов массива.
   * @template S Результирующий тип экземпляра BaseArray.
   * @returns Пустой экземпляр BaseArray.
   */
  static empty<T, S = T>(this: new () => S): S {
    return new this();
  }

  /**
   * Очищает текущий массив, удаляя все элементы.
   * После выполнения массива становится пустым, но сохраняет ссылку.
   */
  clean(): void {
    this.splice(0, this.length);
  }
}

/**
 * Базовый класс для элемента массива, предоставляющий механизм частичного заполнения данных.
 * @template T Тип элемента, который определяется текущим экземпляром.
 */
export class BaseItem<T> {
  /**
   * Конструктор для создания нового элемента, заполняя его указанными данными.
   *
   * @param item Объект с данными, который может быть частично определен.
   * Параметры из этого объекта будут скопированы в текущий экземпляр.
   */
  constructor(item: DeepPartial<T>) {
    assignPartial(this, item);
  }

  /**
   * Создает новый экземпляр текущего класса с переданными данными.
   *
   * @template S Тип возвращаемого экземпляра.
   * @template T Базовый тип, связанный с экземпляром.
   * @param item Объект с данными, который может быть частично определен.
   * @returns Новый экземпляр текущего класса с заполненными данными.
   */
  static of<S, T extends S = S>(
    this: new (item: DeepPartial<T>) => S,
    item: DeepPartial<T>
  ): S {
    return new this(item);
  }
}
