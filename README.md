# ft_transcendence
code 42 project

# Endpoint Document

# BLOCK USER ROUTES

route: '/add-block'
type: 'POST'
schema: {
    body: { id: { type: 'string' } }
}
response : [
    {status: 200, message: 'success'}
]

route: '/remove-block'
type: 'DELETE'
schema: {
    body: { id: { type: 'string' } }
}
response : [
    {status: 200, message: 'success'}
]

route: '/block-list'
type: 'GET'
schema: {
    body: { id: { type: 'string' } }
}
response : [
    {status: 200, payload: number[]}
]

# FRIEND ROUTES
route: '/add-friend'
type: 'POST'
schema: {
    body: { id: { type: 'string' } }
}
response : [
    {status: 200, message: 'success'}
]

route: '/remove-friend'
type: 'DELETE'
schema: {
    body: { id: { type: 'string' } }
}
response : [
    {status: 200, message: 'success'}
]

route: '/friends-list
type: 'GET'
response : [
    {status: 200, payload: number[]}
]

