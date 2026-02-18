export default function PlayerData(
	playerName: string,
	playerScore: number,
	// playerBestTime: number,
): HTMLDivElement {
	const container: HTMLDivElement = document.createElement("div");
	container.className = "col-auto player-info d-flex flex-column align-items-center";

	const nameEl = document.createElement("span");
	nameEl.className = `display-6`;
	nameEl.textContent = playerName;

	const scoreEl = document.createElement("span");
	scoreEl.className = `display-2`;
	scoreEl.textContent = String(playerScore);

	// const bestTimeHeadingEl = document.createElement("span");
	// bestTimeHeadingEl.className = `player-${playerNbr}-best-time-heading`;
	// bestTimeHeadingEl.textContent = "Best time";

	// const bestTimeEl = document.createElement("span");
	// bestTimeEl.className = `player-${playerNbr}-best-time`;
	// bestTimeEl.textContent = `${playerBestTime}s`;

	container.appendChild(nameEl);
	container.appendChild(scoreEl);
	// container.appendChild(bestTimeHeadingEl);
	// container.appendChild(bestTimeEl);

	return container;
}
