export const GameStatus = () => {
	const div = document.createElement("div");
	div.className =
		"title-span p-4 d-flex bg-dark flex-column justify-content-center align-items-center border-img-dark";

	div.innerHTML = `
				<span class="gametimeDisplay display-2 font-monospace">00:00</span>
				<div class="d-flex align-items-center gap-3">
					<span class="roundNbr display-4">1</span>
					<span class="round-slash fs-4">/</span>
					<span class="round-total display-6">10</span>
				</div>
			`;

	const gameTimerEl: HTMLSpanElement = div.querySelector(".gametimeDisplay")!;
	const roundNbrEl: HTMLSpanElement = div.querySelector(".roundNbr")!;

	return {
		element: div,
		timerElement: gameTimerEl,
		roundNbrElement: roundNbrEl,
	};
};
