export type GuestPostDTO = {
    username: string;
    id: number | bigint;
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
    | { error: string }
    | { message: string; username: string; id: number | bigint };