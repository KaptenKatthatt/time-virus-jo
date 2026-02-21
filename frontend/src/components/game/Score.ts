import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		div.innerHTML = `
			<span class="${isMe}">${playerOne.score}</span>
			<span>-</span>
			<span class="${isPlayerTwo}">${playerTwo.score}</span>
		`;

		return div;
	};
	return render();
}
