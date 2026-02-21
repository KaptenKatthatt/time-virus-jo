export interface PlayerUI {
	element: HTMLDivElement;
	update: (name: string, score: number) => void;
}

export default function PlayerData(playerName: string, playerScore: number): PlayerUI {
	const container: HTMLDivElement = document.createElement("div");
	container.className = "col-auto player-info d-flex flex-column align-items-center";

	const nameEl = document.createElement("span");
	nameEl.className = "display-6";
	nameEl.textContent = playerName;

	const scoreEl = document.createElement("span");
	scoreEl.className = "display-2";
	scoreEl.textContent = String(playerScore);

	container.append(nameEl, scoreEl);

	return {
		element: container,
		update: (newName: string, newScore: number) => {
			nameEl.textContent = newName;
			scoreEl.textContent = String(newScore);
		},
	};
}
