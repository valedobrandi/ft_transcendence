import DOMPurify from 'dompurify';

export function ButtonMatchList(context: string, text: string, id: string, action: boolean): string {
    const btnBg = action ? "bg-green-500" : "bg-red-500";
    const html = `<button
                    data-context="${context}"
                    data-id="${id}"
                    data-action="${action ? "true" : "false"}"
                    class="${btnBg} text-white ml-4 p-1 rounded text-xs"
                >
                    ${text}
                </button>`
    const safeText = DOMPurify.sanitize(html);
    return safeText;
}   