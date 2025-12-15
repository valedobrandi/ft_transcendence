
import DOMPurify from 'dompurify';


function EmbeddedButton(friendId: number, text: string, eventId: string, msgId: string, action: string): string {
	const btnBg = text === "YES" ? "bg-green-500" : "bg-red-500";
	const html = `<button
					data-userid="${friendId}"
					data-msgid="${msgId}"
					data-eventid="${eventId}"
					data-action="${action}"
					class="${btnBg} text-white ml-4 p-1 rounded text-xs"
				>
					${text}
				</button>`
	const safeText = DOMPurify.sanitize(html);
	return safeText
}



export { EmbeddedButton};