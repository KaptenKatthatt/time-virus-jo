import virusImg from "../assets/imgs/virusv1.svg";
import sprayOnImg from "../assets/imgs/spray-on100x100.png";

const LOBBY_CHASE_CONFIG = {
	fastestDurationSeconds: 13,
	slowestDurationMultiplier: 1.2,
	minLanePercent: 18,
	laneRangePercent: 56,
	minLaneDifferenceVh: 10,
	rotationDurationSeconds: 2.2,
	glideAmplitudePx: 5,
	glideDurationSeconds: 1.8,
} as const;

export function createLobbyChase(trackElement: HTMLElement) {
	const chaseLayer = document.createElement("div");
	chaseLayer.className = "lobby-chase-layer";

	const chaseRunner = document.createElement("div");
	chaseRunner.className = "lobby-chase-runner";
	chaseRunner.dataset.direction = "right";

	const spray = document.createElement("img");
	spray.className = "lobby-chase-spray";
	spray.src = sprayOnImg;
	spray.alt = "";
	spray.draggable = false;

	const virus = document.createElement("img");
	virus.className = "lobby-chase-virus";
	virus.src = virusImg;
	virus.alt = "";
	virus.draggable = false;

	chaseRunner.append(spray, virus);
	chaseLayer.appendChild(chaseRunner);

	const setRunnerTransform = (positionX: number, glideOffsetY: number) => {
		chaseRunner.style.transform = `translate3d(${positionX}px, ${glideOffsetY}px, 0) translateY(-50%)`;
	};

	const setVirusRotation = (rotationDegrees: number) => {
		virus.style.setProperty("--lobby-chase-virus-rotation", `${rotationDegrees}deg`);
	};

	const getRandomChaseDuration = () => {
		return (
			LOBBY_CHASE_CONFIG.fastestDurationSeconds +
			Math.random() *
				(LOBBY_CHASE_CONFIG.fastestDurationSeconds *
					LOBBY_CHASE_CONFIG.slowestDurationMultiplier -
					LOBBY_CHASE_CONFIG.fastestDurationSeconds)
		);
	};

	const updateTrackBounds = () => {
		chaseLayer.style.top = `${trackElement.offsetTop}px`;
		chaseLayer.style.height = `${trackElement.offsetHeight}px`;
	};

	let lastLanePercent = -999;
	let chaseDirection = 1;
	let chaseDurationSeconds = getRandomChaseDuration();
	let chasePositionX = 0;
	let animationFrameId = 0;
	let isStarted = false;
	let runnerWidth = 0;
	let layerWidth = 0;
	let legStartTime = 0;
	let legDurationMs = 0;
	let legStartX = 0;
	let legEndX = 0;
	let glideOffsetY = 0;
	let lastAnimationTimestamp = 0;
	let virusRotationDegrees = 0;

	const refreshMetrics = () => {
		runnerWidth = Math.ceil(chaseRunner.offsetWidth);
		layerWidth = Math.ceil(chaseLayer.clientWidth);
	};

	const updateLegEndpoints = () => {
		if (chaseDirection === 1) {
			legStartX = -runnerWidth;
			legEndX = layerWidth;
			return;
		}

		legStartX = layerWidth;
		legEndX = -runnerWidth;
	};

	const updateGlide = (timestamp: number) => {
		const glideProgress =
			(timestamp / (LOBBY_CHASE_CONFIG.glideDurationSeconds * 1000)) * Math.PI * 2;
		glideOffsetY = Math.sin(glideProgress) * LOBBY_CHASE_CONFIG.glideAmplitudePx;
	};

	const applyLegProgress = (progress: number) => {
		chasePositionX = legStartX + (legEndX - legStartX) * progress;
		setRunnerTransform(chasePositionX, glideOffsetY);
	};

	const beginLeg = (direction: 1 | -1, timestamp: number, progress = 0) => {
		chaseDirection = direction;
		chaseRunner.dataset.direction = direction === 1 ? "right" : "left";
		legDurationMs = chaseDurationSeconds * 1000;
		updateLegEndpoints();
		legStartTime = timestamp - progress * legDurationMs;
		applyLegProgress(progress);
	};

	const resizeObserver = new ResizeObserver(() => {
		const now = performance.now();
		const currentProgress =
			legDurationMs > 0 ? Math.min((now - legStartTime) / legDurationMs, 1) : 0;
		updateGlide(now);
		updateTrackBounds();
		refreshMetrics();
		updateLegEndpoints();
		legStartTime = now - currentProgress * legDurationMs;
		applyLegProgress(currentProgress);
	});

	const pickNewLane = (): number => {
		const rangeMin = LOBBY_CHASE_CONFIG.minLanePercent;
		const rangeMax = LOBBY_CHASE_CONFIG.minLanePercent + LOBBY_CHASE_CONFIG.laneRangePercent;
		const layerH = chaseLayer.clientHeight;
		const minDiffPercent =
			layerH > 0
				? (LOBBY_CHASE_CONFIG.minLaneDifferenceVh * window.innerHeight) / layerH
				: 10;
		const exclMin = Math.max(rangeMin, lastLanePercent - minDiffPercent);
		const exclMax = Math.min(rangeMax, lastLanePercent + minDiffPercent);
		// No overlap with valid range (e.g. first run where lastLanePercent = -999)
		if (exclMin >= exclMax) {
			return rangeMin + Math.random() * (rangeMax - rangeMin);
		}
		const below = exclMin - rangeMin;
		const above = rangeMax - exclMax;
		const total = below + above;
		if (total <= 0) {
			return rangeMin + Math.random() * (rangeMax - rangeMin);
		}
		const r = Math.random() * total;
		return r < below ? rangeMin + r : exclMax + (r - below);
	};

	const resetChaseFromLeft = (timestamp: number) => {
		const lanePercent = pickNewLane();
		lastLanePercent = lanePercent;
		chaseLayer.style.setProperty("--lobby-chase-y", `${lanePercent}%`);
		chaseDurationSeconds = getRandomChaseDuration();
		beginLeg(1, timestamp);
	};

	const animateChase = (timestamp: number) => {
		if (lastAnimationTimestamp === 0) {
			lastAnimationTimestamp = timestamp;
		}

		const deltaSeconds = (timestamp - lastAnimationTimestamp) / 1000;
		lastAnimationTimestamp = timestamp;
		const rotationDelta = (-360 / LOBBY_CHASE_CONFIG.rotationDurationSeconds) * deltaSeconds;
		virusRotationDegrees += chaseDirection === 1 ? -rotationDelta : rotationDelta;
		setVirusRotation(virusRotationDegrees);

		updateGlide(timestamp);
		const rawProgress = legDurationMs > 0 ? (timestamp - legStartTime) / legDurationMs : 1;
		const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
		applyLegProgress(clampedProgress);

		if (clampedProgress >= 1) {
			if (chaseDirection === 1) {
				beginLeg(-1, timestamp);
			} else {
				resetChaseFromLeft(timestamp);
			}
		}

		animationFrameId = window.requestAnimationFrame(animateChase);
	};

	const onWindowResize = () => {
		const now = performance.now();
		const currentProgress =
			legDurationMs > 0 ? Math.min((now - legStartTime) / legDurationMs, 1) : 0;
		updateGlide(now);
		updateTrackBounds();
		refreshMetrics();
		updateLegEndpoints();
		legStartTime = now - currentProgress * legDurationMs;
		applyLegProgress(currentProgress);
	};

	const start = () => {
		if (isStarted) {
			return;
		}

		isStarted = true;
		updateTrackBounds();
		refreshMetrics();
		setVirusRotation(virusRotationDegrees);
		resetChaseFromLeft(performance.now());
		resizeObserver.observe(trackElement);
		window.addEventListener("resize", onWindowResize);
		animationFrameId = window.requestAnimationFrame(animateChase);
	};

	return {
		element: chaseLayer,
		start,
		destroy: () => {
			window.cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
			window.removeEventListener("resize", onWindowResize);
		},
	};
}
