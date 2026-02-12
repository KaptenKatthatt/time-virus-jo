export function GameBoard() {
	const gameBoard = document.querySelector<HTMLDivElement>(".game-board")!;

	// Generate squares with two loops
	for (let x = 0; x <= 9; x++) {
		for (let y = 0; y <= 9; y++) {
			const cell = document.createElement("div");
			cell.classList.add("cell");
			cell.dataset.x = String(x);
			cell.dataset.y = String(y);
			cell.id = `cell-${x}-${y}`;
			gameBoard.appendChild(cell);
		}
	}
	gameBoard.addEventListener("click", (e) => {
		const clickedCell = e.target as HTMLElement;

		// Log to console coords of virus
		if (clickedCell.classList.contains("cell")) {
			console.log(clickedCell.dataset.x, clickedCell.dataset.y);
		}
	});

	let score: number = 0;
	const playerOneScore = document.querySelector<HTMLSpanElement>(".player-1-score")!;
	playerOneScore.textContent = String(score);

	setInterval(() => {
		const currentVirus = document.querySelector(".virus");
		if (currentVirus) {
			currentVirus.classList.remove("virus");
		}
		const randX = Math.floor(Math.random() * 10);
		const randY = Math.floor(Math.random() * 10);
		const virusCell = document.querySelector(`#cell-${randX}-${randY}`)!;
		virusCell.classList.add("virus");

		virusCell.addEventListener("click", (e) => {
			const clickedVirus = e.target as HTMLElement;
			if (clickedVirus) {
				virusCell.classList.remove("virus");
				score++;
				console.log("Score:", score);
				playerOneScore.textContent = String(score);
			}
		});
	}, 1000);
}
