import { timeFormatter } from "../../utils/timeFormatter";

let gameTime = 0;

export const GameTimer = (startOrStop: string, gameTimerEl?: HTMLSpanElement) => {
	const startTime = performance.now();

	if (startOrStop === "start") {
		let elapsed = 0;

		gameTime = setInterval(() => {
			elapsed = performance.now() - startTime;
			if (gameTimerEl instanceof HTMLSpanElement) {
				gameTimerEl.textContent = timeFormatter(elapsed);
			}
		}, 100);
	} else if (startOrStop === "stop") {
		clearInterval(gameTime);
	}
};

export const restartGameTimer = (gameTimerEl: HTMLSpanElement) => {
	GameTimer("stop");
	GameTimer("start", gameTimerEl);
};
