export function Modal(content: HTMLElement) {
    const render = () => {
        const wrapper = document.createElement("div");
        wrapper.className = "modal fade show";

        const dialog = document.createElement("div");
        dialog.className = "modal-dialog modal-dialog-centered";

        const textbox = document.createElement("div");
        textbox.className = "modal-content p-4 text-center";

        textbox.appendChild(content);
        dialog.appendChild(textbox);
        wrapper.appendChild(dialog);

        return wrapper;
    }
    
    return render();
}