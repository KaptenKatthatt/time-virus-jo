export const GameStatus = () => {
	const div = document.createElement("div");
	div.className =
		"title-span p-4 d-flex bg-dark flex-column justify-content-center align-items-center border-img-dark";

	div.innerHTML = `
				<span class="gametimeDisplay display-2 font-monospace">00:00</span>
				<span class="round display-5">3
					<span class="round-slash fs-4">/</span>
					<span class="round-total display-6">10</span>
				</span>
			`;

	const gameTimerEl: HTMLSpanElement = div.querySelector(".gametimeDisplay")!;

	return {
		element: div,
		timerElement: gameTimerEl,
	};
};
