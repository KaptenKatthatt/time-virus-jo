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

		if (clickedCell.classList.contains("cell")) {
			console.log(clickedCell.dataset.x, clickedCell.dataset.y);
		}
	});

	setInterval(() => {
		const randX = Math.round(Math.random() * 10);
		const randY = Math.round(Math.random() * 10);
		const virusCell = document.querySelector(`#cell-${randX}-${randY}`);
		virusCell?.classList.add("virus");
	}, 2000);
}
