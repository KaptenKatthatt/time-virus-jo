export const CPU_PLAYER_ID = "cpu";
export const CPU_PLAYER_NAME = "CPU";

const CPU_MIN_DELAY_MS = 500;
const CPU_MAX_DELAY_MS = 2000;

/** Mirrors backend summonVirus() but runs entirely in the browser. */
export const summonVirusLocal = () => {
	const x = Math.floor(Math.random() * 10);
	const y = Math.floor(Math.random() * 10);
	const delay = Math.floor(Math.random() * 3000);
	return { x, y, delay };
};

/** Returns a random CPU reaction delay between 500 ms and 2000 ms. */
export const getCpuDelay = () =>
	CPU_MIN_DELAY_MS + Math.random() * (CPU_MAX_DELAY_MS - CPU_MIN_DELAY_MS);

/**
 * Animates a visible CPU cursor from a random board position toward the virus,
 * then calls `onCpuClick` after `cpuDelay` ms.
 *
 * Returns a cancel function that aborts the animation and click.
 */
export const scheduleCpuClick = (
	virusEl: HTMLDivElement,
	boardEl: HTMLDivElement,
	onCpuClick: (cpuReactionTime: number) => void,
	cpuDelay: number,
): (() => void) => {
	const cursor = document.createElement("div");
	cursor.className = "cpu-cursor";
	boardEl.appendChild(cursor);

	let cancelled = false;
	let timeoutId: number;

	// Place cursor at a random start position, then animate to virus centre.
	requestAnimationFrame(() => {
		if (cancelled) return;

		const boardRect = boardEl.getBoundingClientRect();
		const virusRect = virusEl.getBoundingClientRect();

		const targetX = virusRect.left + virusRect.width / 2 - boardRect.left;
		const targetY = virusRect.top + virusRect.height / 2 - boardRect.top;

		const startX = Math.random() * boardRect.width;
		const startY = Math.random() * boardRect.height;

		cursor.style.left = `${startX}px`;
		cursor.style.top = `${startY}px`;

		// Trigger transition on next frame so initial position is painted first.
		requestAnimationFrame(() => {
			if (cancelled) return;
			cursor.style.transition = `left ${cpuDelay}ms linear, top ${cpuDelay}ms linear`;
			cursor.style.left = `${targetX}px`;
			cursor.style.top = `${targetY}px`;

			// Wait one more frame so the transition has been committed by the browser
			// before starting the timeout, ensuring they complete at the same time.
			requestAnimationFrame(() => {
				if (cancelled) return;
				timeoutId = window.setTimeout(() => {
					if (cancelled) return;
					cursor.remove();
					onCpuClick(cpuDelay);
				}, cpuDelay);
			});
		});
	});

	return () => {
		cancelled = true;
		clearTimeout(timeoutId);
		cursor.remove();
	};
};
