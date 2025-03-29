import * as crypto from 'node:crypto';

export function generateUUID(): string {
  // Создаем массив из 16 байт
  const buffer = new Uint8Array(16) as any;

  // Заполняем массив криптографически случайными значениями
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    // Если `crypto` недоступен, используем запасной вариант
    for (let i = 0; i < 16; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }

  // Устанавливаем версии и варианта согласно спецификации UUID v4
  buffer[6] = (buffer[6] & 0x0f) | 0x40; // Версия 4
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // Вариант 10xxxxxx

  // Преобразуем байты в строку формата UUID
  const byteToHex = [] as any;

  for (let i = 0; i < 256; i++) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }

  return (
    byteToHex[buffer[0]] +
    byteToHex[buffer[1]] +
    byteToHex[buffer[2]] +
    byteToHex[buffer[3]] +
    '-' +
    byteToHex[buffer[4]] +
    byteToHex[buffer[5]] +
    '-' +
    byteToHex[buffer[6]] +
    byteToHex[buffer[7]] +
    '-' +
    byteToHex[buffer[8]] +
    byteToHex[buffer[9]] +
    '-' +
    byteToHex[buffer[10]] +
    byteToHex[buffer[11]] +
    byteToHex[buffer[12]] +
    byteToHex[buffer[13]] +
    byteToHex[buffer[14]] +
    byteToHex[buffer[15]]
  );
}
