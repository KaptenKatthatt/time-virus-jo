import virusImg from "../../assets/imgs/virusv1.svg";

export function Virus(x: number, y: number, cb?: (event?: PointerEvent) => void) {
	const listener = (event: PointerEvent) => {
		if (cb) {
			cb(event);
		}
	};

	const render = () => {
		const virus = document.createElement("img");

		virus.src = virusImg;
		virus.className = `virus x${x} y${y}`;
		virus.draggable = false;

		virus.addEventListener("click", listener);

		return virus;
	};

	return render();
}
