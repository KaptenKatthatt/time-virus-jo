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
    }
    
    return render();

}

export function MatchFoundModal() {
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
            }
        }, 1000);

        return Modal(container);
    }
    
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
    }
    
    return render();

}