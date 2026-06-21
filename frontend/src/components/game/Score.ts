import type { PlayerPayload, ScoreReturn } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string): ScoreReturn {
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		const p1Span = document.createElement("span");
		p1Span.textContent = String(playerOne.score);
		if (socketId === playerOne.id) {
			p1Span.classList.add("text-primary");
		}

		const sepSpan = document.createElement("span");
		sepSpan.textContent = "-";

		const p2Span = document.createElement("span");
		p2Span.textContent = String(playerTwo.score);
		if (socketId === playerTwo.id) {
			p2Span.classList.add("text-primary");
		}

		div.appendChild(p1Span);
		div.appendChild(sepSpan);
		div.appendChild(p2Span);

		return {
			element: div,
			// ⚡ Bolt: Expose targeted update method using .textContent to avoid string-to-DOM parsing overhead and layout thrashing
			updateState: (newPlayerOne: PlayerPayload, newPlayerTwo: PlayerPayload) => {
				p1Span.textContent = String(newPlayerOne.score);
				if (socketId === newPlayerOne.id) {
					p1Span.classList.add("text-primary");
				} else {
					p1Span.classList.remove("text-primary");
				}

				p2Span.textContent = String(newPlayerTwo.score);
				if (socketId === newPlayerTwo.id) {
					p2Span.classList.add("text-primary");
				} else {
					p2Span.classList.remove("text-primary");
				}
			}
		};
	};
	return render();
}
