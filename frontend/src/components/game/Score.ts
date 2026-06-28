import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		const p1Span = document.createElement("span");
		const dashSpan = document.createElement("span");
		dashSpan.textContent = "-";
		const p2Span = document.createElement("span");

		div.appendChild(p1Span);
		div.appendChild(dashSpan);
		div.appendChild(p2Span);

		const update = (p1: PlayerPayload, p2: PlayerPayload, sid: string) => {
			const p1Class = sid === p1.id ? "text-primary" : "";
			const p2Class = sid === p2.id ? "text-primary" : "";

			p1Span.className = p1Class;
			p1Span.textContent = String(p1.score);

			p2Span.className = p2Class;
			p2Span.textContent = String(p2.score);
		};

		update(playerOne, playerTwo, socketId);

		return {
			element: div,
			update,
		};
	};
	return render();
}
