import { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";

export function UsernameInput(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
    const render = () => {
        const container = document.createElement("div");
        container.className = "container d-flex justify-content-center align-items-center vh-100";

        const wrapper = document.createElement("div");
        wrapper.className = "text-center p-4 border rounded";

        const title = document.createElement("h1");
        title.className = "mb-2";
        title.innerText = "Virus-game";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter a username";
        input.className = "form-control mb-3 p-2 p-lg-3";

        const button = document.createElement("button");
        button.className = "btn btn-primary px-3 py-2 px-lg-4 py-lg-2";
        button.innerText = "Join";

        button.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = input.value.trim();
            if (!name) {
                return;
            }

            socket.emit("userJoinRequest", name);
        });

        wrapper.appendChild(title);
        wrapper.appendChild(input);
        wrapper.appendChild(button);

        container.appendChild(wrapper);

        return container;
    }

    return render;
} 