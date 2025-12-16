export function QRCodeModal(path: string): HTMLDivElement {
  const ACCENT = "hsl(345,100%,47%)";
  const root = document.createElement("div")
  root.innerHTML =  `
    <div id="qr-code-modal"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="rounded-lg font-mono text-white crt p-10 w-full max-w-fit" style="
            background:#1e2124;
            border:4px solid ${ACCENT};
          ">
        <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:${ACCENT};">
          QR CODE
        </h2>
        <p class="mb-6 text-center">
          SCAN THIS QR CODE WITH YOUR AUTHENTICATOR APP
        </p>
        <div id="qr-code-container" class="flex justify-center mb-6">
          <img src="${path}" alt="2FA QR Code" class="my-4 mx-auto"/>
        </div>
        <div class="flex justify-end gap-4 pt-4">
          <button 
          style="background:#424549;"
          class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
          id="qr-close-button"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  `;

  return root;
}