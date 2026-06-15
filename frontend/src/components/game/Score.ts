import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		const p1Span = document.createElement("span");
		p1Span.className = isMe;
		p1Span.textContent = String(playerOne.score);

		const separator = document.createElement("span");
		separator.textContent = "-";

		const p2Span = document.createElement("span");
		p2Span.className = isPlayerTwo;
		p2Span.textContent = String(playerTwo.score);

		div.appendChild(p1Span);
		div.appendChild(separator);
		div.appendChild(p2Span);

		return {
			element: div,
			update: (newP1: PlayerPayload, newP2: PlayerPayload, newSocketId: string) => {
				const newIsMe = newSocketId === newP1.id ? "text-primary" : "";
				const newIsPlayerTwo = newSocketId === newP2.id ? "text-primary" : "";

				p1Span.className = newIsMe;
				p1Span.textContent = String(newP1.score);

				p2Span.className = newIsPlayerTwo;
				p2Span.textContent = String(newP2.score);
			},
		};
	};
	return render();
}
