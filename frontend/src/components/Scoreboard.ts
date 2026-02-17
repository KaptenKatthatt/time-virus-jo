import type { ScoreboardOmitId } from "../types/scoreboard.types";

export default function Scoreboard() {
	//TODO: get scoreboard data from server
	const data: ScoreboardOmitId[] = [
		{
			name: "name",
			player_one_name: "Jonas",
			player_two_name: "Emil",
			player_one_score: 9,
			player_two_score: 1,
		},
		{
			name: "name",
			player_one_name: "Jonas",
			player_two_name: "Emil",
			player_one_score: 9,
			player_two_score: 1,
		},
		{
			name: "name",
			player_one_name: "Jonas",
			player_two_name: "Emil",
			player_one_score: 9,
			player_two_score: 1,
		},
	];

	const render = () => {
		const div = document.createElement("div");
		div.className = "scoreboard-border-img p-5 text-center";

		const title = document.createElement("h1")
		title.innerText = "Scoreboard"
		title.className = "mb-5 lacquer-regular text-primary"

		const gameResult = GameResult(data);

		div.appendChild(title);
		div.appendChild(gameResult);

		return div;
	};
	return render();
}

function GameResult(data: ScoreboardOmitId[]) {
	const render = () => {
		const div = document.createElement("div");

		div.className = "text-center d-flex flex-column gap-4";

		const elementList = data.map((item: ScoreboardOmitId) => {
			const div = document.createElement("div")
			const sep = document.createElement("span")
			sep.className = "text-muted"

			sep.innerHTML = `
				<span>VS</span>
			`
			div.className = "d-flex justify-content-around align-items-center border-img-small p-1 fs-5"

			const result1 = GameResultItem(item.player_one_name, item.player_one_score, "")
			const result2 = GameResultItem(item.player_two_name, item.player_two_score, "")

			div.appendChild(result1)
			div.appendChild(sep)
			div.appendChild(result2)

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

		div.className =
			"d-flex p-4 flex-column justify-content-center align-items-center gap-2";

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
