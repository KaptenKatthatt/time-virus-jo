import { Modal } from "./Modal";

export function WaitingModal() {
    const render = () => {
        const container = document.createElement("div");

        const spinner = document.createElement("div");
        spinner.className = "spinner-border text-primary mb-3";
        spinner.role = "status";

        const text = document.createElement("p");
        text.className = "text-center";
        text.innerText = "Waiting for opponent";

        container.appendChild(spinner);
        container.appendChild(text);

        let dots = 0;
        setInterval(() => {
            dots = (dots + 1) % 4;
            text.innerText = "Waiting for opponent" + ".".repeat(dots);
        }, 500);

        return Modal(container);
    }
    
    return render();

}