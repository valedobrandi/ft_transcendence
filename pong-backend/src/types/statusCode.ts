type StatusCode =
    | "OK"
    | "CREATED"
    | "NO_CONTENT"
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "INTERNAL_SERVER_ERROR";

export function statusCode(status: StatusCode): number {
    const code: { [key: string]: number } = {
        'OK': 200,
        'CREATED': 201,
        'NO_CONTENT': 204,
        'BAD_REQUEST': 400,
        'UNAUTHORIZED': 401,
        'FORBIDDEN': 403,
        'NOT_FOUND': 404,
        'CONFLICT': 409,
        'INTERNAL_SERVER_ERROR': 500,
    };
    return code[status];
}