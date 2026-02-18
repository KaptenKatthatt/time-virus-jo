export interface PlayerUI {
	element: HTMLDivElement;
	update: (name: string, score: number) => void;
}

export default function PlayerData(
	playerName: string,
	playerScore: number,
	// playerBestTime: number,
): PlayerUI {
	const container: HTMLDivElement = document.createElement("div");
	container.className = "col-auto player-info d-flex flex-column align-items-center";

	const nameEl = document.createElement("span");
	nameEl.className = "display-6";
	nameEl.textContent = playerName;

	const scoreEl = document.createElement("span");
	scoreEl.className = "display-2";
	scoreEl.textContent = String(playerScore);

	// const bestTimeHeadingEl = document.createElement("span");
	// bestTimeHeadingEl.className = `player-${playerNbr}-best-time-heading`;
	// bestTimeHeadingEl.textContent = "Best time";

	// const bestTimeEl = document.createElement("span");
	// bestTimeEl.className = `player-${playerNbr}-best-time`;
	// bestTimeEl.textContent = `${playerBestTime}s`;

	container.append(nameEl, scoreEl);
	// container.appendChild(bestTimeHeadingEl);
	// container.appendChild(bestTimeEl);

	return {
		element: container,
		update: (newName: string, newScore: number) => {
			nameEl.textContent = newName;
			scoreEl.textContent = String(newScore);
		},
	};
}
