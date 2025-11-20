export class Alert {
  private container: HTMLDivElement;

  constructor(message: string) {
    // Create container
    this.container = document.createElement("div");
    this.container.className =
      "fixed inset-0 flex items-center justify-center bg-black/50 z-50";

    // Create alert box
    const box = document.createElement("div");
    box.className =
      "bg-white rounded shadow-lg p-4 relative max-w-sm w-full text-center";

    // Message
    const msg = document.createElement("p");
    msg.innerText = message;
    box.appendChild(msg);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "×";
    closeBtn.className =
      "absolute top-2 right-2 text-gray-500 hover:text-black";
    closeBtn.onclick = () => this.close();
    box.appendChild(closeBtn);

    this.container.appendChild(box);

    // Close when clicking outside the box
    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  show() {
    document.body.appendChild(this.container);
  }

  close() {
    this.container.remove();
  }
}
