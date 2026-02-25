import type { ScoreBoardPayload } from "@shared/types/payloads.types";

export default function Scoreboard(data: ScoreBoardPayload[]) {
	const render = () => {
		const div = document.createElement("div");
		div.className = "border-img-dark p-5 text-center ";

		const title = document.createElement("h1");
		title.innerText = "Scoreboard";
		title.className = "mb-4 lacquer-regular text-primary";

		const gameResult = GameResult(data);

		div.appendChild(title);
		div.appendChild(gameResult);

		return div;
	};
	return render();
}

function GameResult(data: ScoreBoardPayload[]) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "text-center d-flex flex-column gap-3 overflow";

		const elementList = data.map((item) => {
			const div = document.createElement("div");

			div.className = "d-flex justify-content-center flex-column border-img-green-small p-2";

			const dateTime = document.createElement("span");
			const createdAt = new Date(item.createdAt);
			const date = createdAt.toLocaleDateString("sv-SE");
			const time = createdAt.toLocaleTimeString("sv-SE");
			dateTime.innerText = `${date} ${time}`;
			dateTime.className = "pb-4";

			const separator = document.createElement("span");
			separator.className = "text-muted";
			separator.innerHTML = `
				<span>VS</span>
			`;
			separator.className = "lacquer-regular text-muted";

			const wrapper = document.createElement("div");
			wrapper.className = "d-flex justify-content-around align-items-center fs-5";

			const result1 = GameResultItem(item.player_one_name, item.player_one_score, "");
			const result2 = GameResultItem(item.player_two_name, item.player_two_score, "");

			wrapper.appendChild(result1);
			wrapper.appendChild(separator);
			wrapper.appendChild(result2);

			div.appendChild(wrapper);
			div.appendChild(dateTime);

			return div;
		});

		elementList.forEach((item: HTMLDivElement) => {
			div.appendChild(item);
		});

		return div;
	};
	return render();
}

function GameResultItem(name: string, score: number, winner: string) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "d-flex p-3 flex-column justify-content-center align-items-center gap-2";

		if (winner === name) {
			div.classList.add("text-success");
			div.classList.add("fw-bold");
		}

		div.innerHTML = `
			<span>${name}</span>
			<span>${score}</span>
		`;

		return div;
	};
	return render();
}
