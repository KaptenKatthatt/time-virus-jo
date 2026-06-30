import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		const p1Span = document.createElement("span");
		p1Span.className = socketId === playerOne.id ? "text-primary" : "";
		p1Span.textContent = String(playerOne.score);

		const dashSpan = document.createElement("span");
		dashSpan.textContent = "-";

		const p2Span = document.createElement("span");
		p2Span.className = socketId === playerTwo.id ? "text-primary" : "";
		p2Span.textContent = String(playerTwo.score);

		div.appendChild(p1Span);
		div.appendChild(dashSpan);
		div.appendChild(p2Span);

		return {
			element: div,
			update: (p1: PlayerPayload, p2: PlayerPayload, currentSocketId: string) => {
				// ⚡ Bolt: Expose targeted update method to directly mutate DOM nodes and
				// skip string-to-DOM parsing overhead during frequent socket updates
				p1Span.className = currentSocketId === p1.id ? "text-primary" : "";
				p1Span.textContent = String(p1.score);

				p2Span.className = currentSocketId === p2.id ? "text-primary" : "";
				p2Span.textContent = String(p2.score);
			},
		};
	};
	return render();
}
