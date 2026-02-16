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
		const table = document.createElement("table");

		table.className = "table border";

		const thead = TableHead();
		const tbody = TableBody(data);

		table.appendChild(thead);
		table.appendChild(tbody);

		return table;
	};
	return render();
}

function TableHead() {
	const render = () => {
		const thead = document.createElement("thead");

		thead.className = "text-center";

		thead.innerHTML = `
		<tr>
			<th class="col">Player one</th>
			<th class="col">Score</th>
			<th class="col">Score</th>
			<th class="col">Player Two</th>
		</tr>
		`;
		return thead;
	};
	return render();
}

function TableBody(data: ScoreboardOmitId[]) {
	const render = () => {
		const tbody = document.createElement("tbody");

		tbody.className = "text-center";

		const elementList = data.map((item: ScoreboardOmitId) => {
			const tr = document.createElement("tr");

			tr.innerHTML = `
				<td>
					${item.player_one_name}
				</td>
				<td>
					${item.player_one_score}
				</td>
				<td >
					${item.player_two_score}
				</td>
				<td>
					${item.player_two_name}
				</td>
			`;

			return tr;
		});

		elementList.forEach((item: HTMLTableRowElement) => {
			tbody.appendChild(item);
		});

		return tbody;
	};
	return render();
}
