export class Alert {
  private container: HTMLDivElement;

  private handleAnyClick = () => {
    this.close();
  };


  constructor(message: string) {
    // Create container
    this.container = document.createElement("div");
    this.container.className =
      "fixed inset-0 flex items-center justify-center bg-black/50 z-50";

    // Create alert box
    const box = document.createElement("div");
    box.className = [
      "uppercase",
      "game-font ",
      "relative",
      "p-6",
      "w-[90%]",
      "text-center",
      "rounded-lg",
      "font-bold",
      "tracking-wide",
      "text-2xl",
      "select-none",
      "pixel-border"
    ].join(" ");

    // Message
    const msg = document.createElement("p");
    msg.innerText = message;
    box.appendChild(msg);

    this.container.appendChild(box);

    document.addEventListener("click", this.handleAnyClick);

    document.addEventListener("keydown", this.handleAnyClick);
  }

  show() {
    document.body.appendChild(this.container);
  }

  close() {
    document.removeEventListener("click", this.handleAnyClick);
    this.container.remove();
  }
}
