import virusImg from "../../assets/imgs/virusv1.svg";

export function Virus(x: number, y: number, cb?: (event?: MouseEvent) => void) {
	const listener = (event: MouseEvent) => {
		if (cb) {
			cb(event);
		}
	};

	const render = () => {
		const virus = document.createElement("img");

		virus.src = virusImg;
		virus.className = `virus x${x} y${y} spray-cursor-on`;
		virus.draggable = false;

		virus.addEventListener("click", listener);

		return virus;
	};

	return render();
}
