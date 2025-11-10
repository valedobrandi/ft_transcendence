# ft_transcendence
code 42 project

# Endpoint Document

# route: '/block-user'
type: 'POST'
schema: {
    type: 'object',
    properties: {
        userId: { type: 'number' },
        blockedUserId: { type: 'number' },
    },
    required: ['userId', 'blockedUserId']
}
status: 200 / 400

# route: '/unblock-user'
type: 'DELETE'
schema: {
    type: 'object',
    properties: {
        userId: { type: 'number' },
        blockedUserId: { type: 'number' },
    },
    required: ['userId', 'blockedUserId']
}
status: 200 / 400

# route: '/blocked-users/:userId'
type: 'GET'
schema: {
    type: 'object',
    properties: {
        userId: { type: 'number' },
    },
    required: ['userId']
}
status: 200 / 400
data: {
    payload: number[]
} 

