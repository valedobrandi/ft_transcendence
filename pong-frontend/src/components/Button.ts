import { navigateTo } from "../utils";

export function Button(label: string, style = "", onClick: () => void): HTMLElement {
    const buttonElement = document.createElement("button");
    buttonElement.id = label.toLowerCase() + "-button";
    buttonElement.textContent = label;
    buttonElement.className = `bg-black text-white
		uppercase font-bold cursor-pointer rounded ` + style;
    buttonElement.onclick = onClick;

	return buttonElement;
}

export function FancyButton(label: string, style = "", onClick: () => void): HTMLElement {
    const buttonElement = document.createElement("button");
    buttonElement.className = `button-fancy-pushable ${style}`;
    buttonElement.setAttribute("role", "button");

    const edge = document.createElement("span");
    edge.className = "button-fancy-edge";

    const front = document.createElement("span");
    front.className = "button-fancy-front text";
    front.textContent = label;

    buttonElement.appendChild(edge);
    buttonElement.appendChild(front);

    buttonElement.onclick = onClick;

    return (buttonElement);
}

export function ReturnButton(location: string): HTMLElement
{
    const backBtn = document.createElement("button");
    backBtn.className = `
      absolute left-3 top-2
      flex items-center justify-center
      w-12 h-12
      group
      transition
    `;
  
    backBtn.innerHTML = `
      <div class="
        w-12 h-12 flex items-center justify-center
        bg-black/40 border border-red-600
        rounded-xl
        shadow-[0_0_10px_rgba(255,0,0,0.4)]
        group-hover:shadow-[0_0_18px_rgba(255,0,0,0.9)]
        group-hover:border-red-500
        transition-all duration-200
        group-hover:scale-110
      ">
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="w-8 h-8 text-red-500 group-hover:text-red-400 transition">
          
          <!-- Chevron gaming stylisé -->
          <path fill="currentColor"
            d="M14.8 3.3 6.1 12l8.7 8.7 1.9-1.9L9.9 12l6.8-6.8-1.9-1.9z"/>
        </svg>
      </div>
    `;
  
    backBtn.onclick = () => {
      navigateTo(location);
    };

    return backBtn;
}
