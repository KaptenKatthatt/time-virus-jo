export const CPU_PLAYER_ID = "cpu";
export const CPU_PLAYER_NAME = "CPU";

type Point = { x: number; y: number };
type CursorTipOffset = { x: number; y: number };

const CPU_MIN_DELAY_MS = 500;
const CPU_MAX_DELAY_MS = 2000;
const CPU_CURSOR_SVG_VIEWBOX_SIZE = 20;
const CPU_CURSOR_TIP_SVG_X = 2;
const CPU_CURSOR_TIP_SVG_Y = 2;

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

const interpolateLinearly = (from: number, to: number, progress: number) =>
	from + (to - from) * progress;

const getRandomBoardEdgePoint = (boardRect: DOMRect): Point => {
	const edge = Math.floor(Math.random() * 4);

	switch (edge) {
		case 0:
			return { x: Math.random() * boardRect.width, y: 0 };
		case 1:
			return { x: boardRect.width, y: Math.random() * boardRect.height };
		case 2:
			return { x: Math.random() * boardRect.width, y: boardRect.height };
		default:
			return { x: 0, y: Math.random() * boardRect.height };
	}
};

const getCursorTipOffset = (cursor: HTMLDivElement): CursorTipOffset => ({
	x: (CPU_CURSOR_TIP_SVG_X / CPU_CURSOR_SVG_VIEWBOX_SIZE) * cursor.offsetWidth,
	y: (CPU_CURSOR_TIP_SVG_Y / CPU_CURSOR_SVG_VIEWBOX_SIZE) * cursor.offsetHeight,
});

const setCursorTipPosition = (
	cursor: HTMLDivElement,
	position: Point,
	tipOffset: CursorTipOffset,
) => {
	cursor.style.left = `${position.x - tipOffset.x}px`;
	cursor.style.top = `${position.y - tipOffset.y}px`;
};

const getVisibleVirusCenter = (virusEl: HTMLDivElement, boardRect: DOMRect): Point => {
	const virusImages = Array.from(virusEl.querySelectorAll<HTMLImageElement>(".virus"));
	let visibleVirus: HTMLImageElement | null = null;
	let visibleOpacity = -1;

	for (const image of virusImages) {
		const currentOpacity = Number.parseFloat(getComputedStyle(image).opacity);
		if (currentOpacity > visibleOpacity) {
			visibleOpacity = currentOpacity;
			visibleVirus = image;
		}
	}

	const visibleElement = visibleVirus ?? virusEl;
	const virusRect = visibleElement.getBoundingClientRect();

	return {
		x: virusRect.left + virusRect.width / 2 - boardRect.left,
		y: virusRect.top + virusRect.height / 2 - boardRect.top,
	};
};

/**
 * Moves the red CPU cursor in a straight line from a board edge to the
 * currently visible virus center, then triggers the CPU hit.
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
	let animationFrameId = 0;

	// Animate the visible cursor tip to the virus center and only then trigger the hit.
	requestAnimationFrame(() => {
		if (cancelled) return;

		const boardRect = boardEl.getBoundingClientRect();
		const startPoint = getRandomBoardEdgePoint(boardRect);
		const cursorTipOffset = getCursorTipOffset(cursor);
		const animationStart = performance.now();
		const animationDuration = Math.max(cpuDelay, 1);

		setCursorTipPosition(cursor, startPoint, cursorTipOffset);

		const animateCursor = (now: number) => {
			if (cancelled) return;

			const elapsed = now - animationStart;
			const progress = Math.min(elapsed / animationDuration, 1);
			const liveBoardRect = boardEl.getBoundingClientRect();
			const target = getVisibleVirusCenter(virusEl, liveBoardRect);
			const currentPosition: Point = {
				x: interpolateLinearly(startPoint.x, target.x, progress),
				y: interpolateLinearly(startPoint.y, target.y, progress),
			};

			setCursorTipPosition(cursor, currentPosition, cursorTipOffset);

			if (progress >= 1) {
				setCursorTipPosition(cursor, target, cursorTipOffset);

				animationFrameId = requestAnimationFrame(() => {
					if (cancelled) return;
					if (!virusEl.isConnected) return;

					cursor.remove();
					onCpuClick(cpuDelay);
				});
				return;
			}

			animationFrameId = requestAnimationFrame(animateCursor);
		};

		animationFrameId = requestAnimationFrame(animateCursor);
	});

	return () => {
		cancelled = true;
		cancelAnimationFrame(animationFrameId);
		cursor.remove();
	};
};
