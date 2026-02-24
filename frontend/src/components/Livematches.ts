import type { LiveGameData } from "@shared/types/payloads.types";

export default function Livematches(liveGames: LiveGameData[]) {
	const render = () => {
		const div = document.createElement("div");
		div.className = "border-img-dark p-5 text-center";

		const title = document.createElement("h1");
		title.innerText = "🔴 Live matches";
		title.className = "mb-4 lacquer-regular text-primary";

		const matchtList = Livematchlist(liveGames);

		div.appendChild(title);
		div.appendChild(matchtList);

		return div;
	};
	return render();
}

function Livematchlist(data: LiveGameData[]) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "text-center d-flex flex-column gap-3";

		const elementList = data.map((item) => {
			const div = document.createElement("div");
			const sep = document.createElement("span");
			sep.className = "text-muted";

			sep.innerHTML = `
				<span>VS</span>
			`;
			div.className =
				"d-flex justify-content-around align-items-center border-img-green-small p-1 fs-4";

			const result1 = LiveMatchItem(item.player_one_name, item.player_one_score);
			const result2 = LiveMatchItem(item.player_two_name, item.player_two_score);

			div.appendChild(result1);
			div.appendChild(sep);
			div.appendChild(result2);

			return div;
		});

		elementList.forEach((item: HTMLDivElement) => {
			div.appendChild(item);
		});

		return div;
	};
	return render();
}

function LiveMatchItem(name: string, score: number) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "d-flex p-3 flex-column justify-content-center align-items-center gap-2";

		div.innerHTML = `
			<span>${name}</span>
			<span>${score}</span>
		`;

		return div;
	};
	return render();
}
