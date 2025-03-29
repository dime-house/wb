export async function wait(condition: () => boolean, period?: number): Promise<void>;
export async function wait(ms: number, interval?: number): Promise<void>;
export async function wait(predicate: number | (() => boolean), period = 0) {
	if (typeof predicate === 'number') {
		await new Promise((resolve) => setTimeout(resolve, predicate));
	} else {
		await new Promise<void>((resolve) => {
			const intervalId = setInterval(() => {
				if (!predicate()) {
					clearInterval(intervalId);
					resolve();
				}
			}, period);
		});
	}
}
