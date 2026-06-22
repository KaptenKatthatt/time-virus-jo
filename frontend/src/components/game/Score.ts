import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		const p1Span = document.createElement("span");
		const sepSpan = document.createElement("span");
		sepSpan.textContent = "-";
		const p2Span = document.createElement("span");

		div.appendChild(p1Span);
		div.appendChild(sepSpan);
		div.appendChild(p2Span);

		const update = (p1: PlayerPayload, p2: PlayerPayload, currentSocketId: string) => {
			const isMe = currentSocketId === p1.id ? "text-primary" : "";
			const isPlayerTwo = currentSocketId === p2.id ? "text-primary" : "";

			p1Span.className = isMe;
			p1Span.textContent = p1.score.toString();

			p2Span.className = isPlayerTwo;
			p2Span.textContent = p2.score.toString();
		};

		update(playerOne, playerTwo, socketId);

		// ⚡ Bolt: Return element and update method to avoid component recreation and .innerHTML parsing overhead
		return {
			element: div,
			update,
		};
	};
	return render();
}
