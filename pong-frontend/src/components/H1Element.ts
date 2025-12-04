
export function H1Element(classList: string[]): HTMLHeadingElement {
  const h1 = document.createElement("h1");
  h1.classList.add(...classList);
  return h1;
}
