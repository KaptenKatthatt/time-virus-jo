import Button from "./Button";
import { Modal } from "./Modal";

export function WaitingModal() {
	const render = () => {
		const container = document.createElement("div");
		const spinner = document.createElement("div");
		spinner.className = "spinner-border text-primary mb-3 mt-3";
		spinner.role = "status";

		const text = document.createElement("p");
		text.className = "text-center waiting-txt";
		text.innerText = "Waiting for opponent";

		container.appendChild(spinner);
		container.appendChild(text);

		return Modal(container);
	};

	return render();
}

export function SelectRoundsModal(
	selectorName: string,
	onSelect: (totalRounds: number) => void,
	minRounds = 1,
	maxRounds = 10,
	defaultRounds = 3,
) {
	const render = () => {
		const container = document.createElement("div");
		container.className = "disconnect-modal d-flex flex-column gap-3 align-items-center";

		const title = document.createElement("h2");
		title.innerText = "Select number of rounds";

		const text = document.createElement("p");
		text.className = "my-2";
		text.innerText = `${selectorName}, choose how many rounds to play`;

		const input = document.createElement("input");
		input.type = "number";
		input.min = String(minRounds);
		input.max = String(maxRounds);
		input.value = String(defaultRounds);
		input.className = "form-control text-center";
		input.style.maxWidth = "180px";

		const button = Button("Start", () => {
			const parsedRounds = Number(input.value);
			const safeRounds = Math.min(maxRounds, Math.max(minRounds, Math.floor(parsedRounds)));
			onSelect(Number.isFinite(safeRounds) ? safeRounds : defaultRounds);
		});

		container.appendChild(title);
		container.appendChild(text);
		container.appendChild(input);
		container.appendChild(button);

		return Modal(container);
	};

	return render();
}

export function WaitingForRoundSelectionModal(selectorName: string) {
	const render = () => {
		const container = document.createElement("div");
		const spinner = document.createElement("div");
		spinner.className = "spinner-border text-primary mb-3 mt-3";
		spinner.role = "status";

		const text = document.createElement("p");
		text.className = "text-center waiting-txt";
		text.innerText = `Waiting for ${selectorName} to select number of rounds`;

		container.appendChild(spinner);
		container.appendChild(text);

		return Modal(container);
	};

	return render();
}

export function MatchFoundModal(cb?: () => void) {
	const render = () => {
		const container = document.createElement("div");
		container.className = "match-modal";

		const title = document.createElement("h2");
		title.innerText = "Match starts in:";

		const text = document.createElement("p");
		text.className = "fw-bold display-4 mt-3";
		text.innerText = "3";

		container.appendChild(title);
		container.appendChild(text);

		let time = 3;
		const interval = setInterval(() => {
			time--;
			text.innerText = String(time);
			if (time === 0) {
				clearInterval(interval);
				if (cb) cb();
			}
		}, 1000);

		return Modal(container);
	};

	return render();
}

export function DisconnectedUser(playerName: string, onReturn?: () => void) {
	const render = () => {
		const container = document.createElement("div");
		container.className = "disconnect-modal";

		const title = document.createElement("h2");
		title.innerText = "Player disconnected";

		const text = document.createElement("p");
		text.className = "my-4";
		text.innerText = `${playerName} has left the game`;

		const button = Button("Return to lobby", () => {
			if (onReturn) onReturn();
		});

		container.appendChild(title);
		container.appendChild(text);
		container.appendChild(button);

		return Modal(container);
	};

	return render();
}

export function RematchModal(playerName: string, onClick?: () => void, onCancel?: () => void) {
	const render = () => {
		const container = document.createElement("div");
		container.className = "disconnect-modal";

		const title = document.createElement("h2");
		title.innerText = "Player wants a rematch";

		const text = document.createElement("p");
		text.className = "my-4";
		text.innerText = `${playerName} requested a Rematch`;

		const btnWrapper = document.createElement("div");
		btnWrapper.className = "d-flex gap-5";

		const rematchbtn = Button("Rematch", () => {
			if (onClick) onClick();
		});
		const cancelbtn = Button("Cancel", () => {
			if (onCancel) onCancel();
		});
		cancelbtn.classList.add("border-img-dark-solid");
		cancelbtn.classList.remove("border-img-green-solid");

		container.appendChild(title);
		container.appendChild(text);
		btnWrapper.appendChild(rematchbtn);
		btnWrapper.appendChild(cancelbtn);

		container.appendChild(btnWrapper);

		return Modal(container);
	};

	return render();
}
