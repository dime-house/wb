/**
 * Проверяет, является ли nextDate следующим днём после currentDate.
 * @param currentDate - Текущая дата
 * @param nextDate - Следующая дата
 * @returns true, если nextDate на следующий день после currentDate; иначе false
 */
export function isNextDay(currentDate: Date, nextDate: Date): boolean {
	const nextDay = new Date(currentDate);

	nextDay.setDate(currentDate.getDate() + 1);

	return isSameDay(nextDay, nextDate);
}

/**
 * Получает последний день месяца для заданной даты.
 * @param date - Дата для расчёта
 * @returns Последний день месяца
 */
export function getLastDayOfMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Проверяет, является ли заданная дата первым днём месяца.
 *
 * @param {Date} date - Дата для проверки.
 * @return {boolean} Истина, если дата является первым днём месяца, иначе ложь.
 */
export function isFirstMonthDay(date: Date): boolean {
	return date.getDate() === 1;
}

/**
 * Проверяет, является ли заданная дата последним днём месяца.
 *
 * @param {Date} date - Дата для проверки.
 * @return {boolean} Истина, если дата является последним днём месяца, иначе ложь.
 */
export function isLastMonthDay(date: Date): boolean {
	return date.getDate() === getLastDayOfMonth(date);
}

/**
 * Проверка, что две даты принадлежат одному и тому же дню.
 * @param d1 Первая дата
 * @param d2 Вторая дата
 * @returns true, если день, месяц и год совпадают; иначе false
 */
export function isSameDay(d1: Date, d2: Date): boolean {
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
