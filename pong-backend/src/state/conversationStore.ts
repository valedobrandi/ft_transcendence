import type { chatStore } from '../classes/ChatStore' // or the file that exports the type
export const conversationStore = new Map<string, typeof chatStore>();

