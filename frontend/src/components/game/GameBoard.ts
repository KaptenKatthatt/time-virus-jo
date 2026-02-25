export default function GameBoard() {
	const render = () => {
		const gameBoard = document.createElement("div");
		gameBoard.className = "game-board m-auto border-img-dark spray-cursor-off";
		return gameBoard;
	};
	return render();
}
