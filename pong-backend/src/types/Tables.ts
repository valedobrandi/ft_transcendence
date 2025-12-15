export type ChatModelTable = {
    id: number,
    user_id: number,
    blockedId: number,
}

export type MessageModelTable = {
    id: number,
    sender_id: number,
    receiver_id: number,
    content: string,
    timestamp: string,
    isRead: number,
}

export type UserModelTable = {
    id: number,
    username: string,
    email: string,
    password: string,
    status: string,
    twoFA_enabled: number,
    created_at: string,
}