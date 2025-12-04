export function FixedContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.className =
    "fixed inset-0 flex items-center justify-center bg-black/50 z-50";
  return container;
}

