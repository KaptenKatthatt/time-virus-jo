export function Modal(content: HTMLElement) {
    const render = () => {
        const wrapper = document.createElement("div");
        wrapper.className = "modal fade show";

        wrapper.style.position = "fixed";
        wrapper.style.top = "0";
        wrapper.style.left = "0";
        wrapper.style.width = "100vw";
        wrapper.style.height = "100vh";
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "center";
        wrapper.style.alignItems = "center";
        wrapper.style.background = "rgba(0,0,0,0.5)";
        wrapper.style.zIndex = "2000";


        const dialog = document.createElement("div");
        dialog.className = "modal-dialog modal-dialog-centered";

        const textbox = document.createElement("div");
        textbox.className = "modal-content p-2 text-center";

        textbox.appendChild(content);
        dialog.appendChild(textbox);
        wrapper.appendChild(dialog);

        return wrapper;
    }
    
    return render();
}