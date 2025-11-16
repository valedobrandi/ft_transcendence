import "../css/loading.css"

export function Loading(): string {
    return (
        `<div class="loader-overlay">
        <div class="typing-indicator">
            <div class="typing-circle"></div>
            <div class="typing-circle"></div>
            <div class="typing-circle"></div>
            <div class="typing-shadow"></div>
            <div class="typing-shadow"></div>
            <div class="typing-shadow"></div>
            </div>
        </div>`
    )
}