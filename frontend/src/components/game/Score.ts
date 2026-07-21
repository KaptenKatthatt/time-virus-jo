import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		// ⚡ Bolt: Expose targeted DOM node updates for .textContent to prevent expensive .innerHTML string-to-DOM parsing overhead during high-frequency game updates
		div.innerHTML = `
			<span class="player-one-score ${isMe}">${playerOne.score}</span>
			<span>-</span>
			<span class="player-two-score ${isPlayerTwo}">${playerTwo.score}</span>
		`;

		const playerOneScoreEl = div.querySelector<HTMLSpanElement>(".player-one-score")!;
		const playerTwoScoreEl = div.querySelector<HTMLSpanElement>(".player-two-score")!;

		return {
			element: div,
			updateScores: (playerOneScore: number, playerTwoScore: number) => {
				playerOneScoreEl.textContent = String(playerOneScore);
				playerTwoScoreEl.textContent = String(playerTwoScore);
			},
		};
	};
	return render();
}
