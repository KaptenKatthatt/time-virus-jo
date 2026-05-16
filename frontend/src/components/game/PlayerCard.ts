import type { PlayerPayload } from "../../types/game.types";
import { timeFormatter } from "../../utils/timeFormatter";
import { escapeHtml } from "../../utils/sanitize";

export function PlayerCard(player: PlayerPayload, socketId: string) {
	let playerId = player.id;
	const name = player.name;

	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerId ? "text-primary" : "";

		div.className =
			"d-flex justify-content-evenly flex-column bg-dark align-items-center p-4 border-img-dark";

		div.innerHTML = `
			<span class="name ${isMe} display-lg-5 display-6">${escapeHtml(name)}</span>
			<span class="player-reaction-time fs-2">00:00</span>
		`;
		const reactionTimeEl = div.querySelector<HTMLSpanElement>(".player-reaction-time")!;

		const playerNameEl = div.querySelector<HTMLDivElement>(".name")!;

		return {
			element: div,
			updateReactionTime: (reactionTime: number) => {
				reactionTimeEl.textContent = timeFormatter(reactionTime);
			},
			updateName: (name: string) => {
				playerNameEl.textContent = name;
			},
			updatePlayerId: (newPlayerId: string) => {
				playerId = newPlayerId;
				if (newPlayerId === socketId) {
					playerNameEl.classList.add("text-primary");
				}
			},
		};
	};
	return render();
}
