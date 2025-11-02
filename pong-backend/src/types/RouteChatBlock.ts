export type ChatBlockPostDTO = {
    userId: number;
    blockedUserId: number;
}

export type ChatBlockDeleteDTO = {
    userId: number;
    blockedUserId: number;
}

export type ChatBlockGetDTO = {
    userId: number;
}

export const chatBlockPostSchema = {
    type: 'object',
    properties: {
        userId: { type: 'number' },
        blockedUserId: { type: 'number' },
    },
    required: ['userId', 'blockedUserId'],
};

export const chatBlockDeleteSchema = {
    type: 'object',
    properties: {
        userId: { type: 'number' },
        blockedUserId: { type: 'number' },
    },
    required: ['userId', 'blockedUserId'],
};

export const chatBlockGetSchema = {
    type: 'object',
    properties: {
        userId: { type: 'number' },
    },
    required: ['userId'],
    additionalProperties: false,
};
