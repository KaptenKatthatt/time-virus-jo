import { Modal } from "./Modal";

export function WaitingModal() {
    const render = () => {
        const container = document.createElement("div");

        const spinner = document.createElement("div");
        spinner.className = "spinner-border text-primary mb-3 mt-3";
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

export function MatchFoundModal() {
    const render = () => {
        const container = document.createElement("div");
        container.className = "match-modal";

        const title = document.createElement("h2");
        title.innerText = "Match starts in:";

        const countdown = document.createElement("p");
        countdown.className = "fw-bold display-4 mt-3";
        countdown.innerText = "3";

        container.appendChild(title);
        container.appendChild(countdown);

        let time = 3;
        const interval = setInterval(() => {
            time--;
            countdown.innerText = String(time);
            if (time === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return Modal(container);
    }
    
    return render();

}