function EmbeddedButton(friendId: number, text: string, eventId: string, id: string): string {
    const btnBg = text === "YES" ? "bg-green-500" : "bg-red-500";
    return (
        `<button
			id="${id}"
			data-tagname="${friendId}"
			data-eventid="${eventId}"
			action="${text === "YES" ? "accept" : "decline"}"
			class="${btnBg} text-white ml-4 p-1 rounded text-xs"
		>
			${text}
		</button>`
    )
}

export { EmbeddedButton };