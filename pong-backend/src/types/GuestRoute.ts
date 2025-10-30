export type GuestPostDTO = {
    username: string;
    code: string
};

export const GuestPostSchema = {
    type: 'object',
    properties: {
        username: { type: 'string', minLength: 3 }
    },
    required: ['username'],
}