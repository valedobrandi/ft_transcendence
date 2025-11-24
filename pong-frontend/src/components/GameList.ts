import { items } from "./GameContainer";


export function GameList() {
  return `
    <div class="flex-1 overflow-y-auto min-h-0 p-8">
      <ul class="space-y-2">
        ${items
      .map(
        (item) => `
              <li class="text-center rounded border border-border">
                ${item}
              </li>
            `
      )
      .join("")}
      </ul>
    </div>
  `;
}
