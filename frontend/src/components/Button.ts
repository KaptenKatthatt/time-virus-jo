export default function Button(text: string, cb?: (event?: MouseEvent) => void) {
	const listener = (event: MouseEvent) => {
		if (cb) {
			cb(event);
		}
	};

	const render = () => {
		const button = document.createElement("button");

		button.className = "btn border-img-green-solid";

		button.innerText = text;
		button.addEventListener("click", listener);

		return button;
	};
	return render();
}
