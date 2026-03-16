import virusImg from "../../assets/imgs/virusv1.svg";

export function Virus(x: number, y: number, cb?: (event?: MouseEvent) => void) {
	const listener = (event: MouseEvent) => {
		if (cb) {
			cb(event);
		}
	};

	const render = () => {
		const hitbox = document.createElement("div");
		const loiterVirus = document.createElement("img");
		const attackVirus = document.createElement("img");

		hitbox.className = `virus-hitbox x${x} y${y} spray-cursor-on`;

		loiterVirus.src = virusImg;
		loiterVirus.className = "virus virus--loiter";
		loiterVirus.draggable = false;
		loiterVirus.alt = "";

		attackVirus.src = virusImg;
		attackVirus.className = "virus virus--attack";
		attackVirus.draggable = false;
		attackVirus.alt = "";

		hitbox.append(loiterVirus, attackVirus);
		hitbox.addEventListener("click", listener);

		return hitbox;
	};

	return render();
}
