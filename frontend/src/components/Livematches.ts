import type { LiveGameData } from "@shared/types/payloads.types";
import { escapeHtml } from "../utils/escapeHtml";

export default function Livematches(liveGames: LiveGameData[]) {
	const render = () => {
		const div = document.createElement("div");
		div.className = "border-img-dark px-3 py-4 text-center";

		const title = document.createElement("h5");
		title.innerText = "Live Games";
		title.className = `lobby-section-heading liveHeading lacquer-regular text-primary pulsing-circle${
			liveGames.length > 0 ? " pb-3" : ""
		}`;

		const matchList = Livematchlist(liveGames);

		div.appendChild(title);
		div.appendChild(matchList);

		return div;
	};
	return render();
}

function Livematchlist(data: LiveGameData[]) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "text-center d-flex flex-column gap-3";

		// ⚡ Bolt: Replace multi-pass map/forEach with single-pass for...of loop to prevent intermediate array allocation
		for (const item of data) {
			const itemDiv = document.createElement("div");
			const sep = document.createElement("span");
			sep.className = "text-muted";

			sep.innerHTML = `
				<span>VS</span>
			`;
			itemDiv.className =
				"d-flex justify-content-around align-items-center border-img-green-small p-1 fs-4";

			const result1 = LiveMatchItem(item.player_one_name, item.player_one_score);
			const result2 = LiveMatchItem(item.player_two_name, item.player_two_score);

			itemDiv.appendChild(result1);
			itemDiv.appendChild(sep);
			itemDiv.appendChild(result2);

			div.appendChild(itemDiv);
		}

		return div;
	};
	return render();
}

function LiveMatchItem(name: string, score: number) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "d-flex p-3 flex-column justify-content-center align-items-center gap-2";

		div.innerHTML = `
			<span>${escapeHtml(name)}</span>
			<span>${score}</span>
		`;

		return div;
	};
	return render();
}
