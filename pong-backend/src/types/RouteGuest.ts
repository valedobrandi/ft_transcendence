export type GuestPostDTO = {
    username: string;
    id: number;
    code: string
};

export const guestPostSchema = {
    type: 'object',
    properties: {
        username: { type: 'string', minLength: 3 }
    },
    required: ['username'],
}

export type SaveUser =
    | { status: "error", error: string }
    | { message: string; username: string; id: number | bigint };