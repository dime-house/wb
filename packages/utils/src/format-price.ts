export function formatPrice(value: number) {
	const val = (value / 100 / 1).toFixed(2).replace('.', ',');
	return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
