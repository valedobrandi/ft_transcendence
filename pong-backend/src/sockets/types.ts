export type ConnectType = {
    type: 'CONNECT';
    id: string;
};

export type MatchType = {
    type: 'MATCH';
    id: string;
};

export type MovePaddleType = {
    type: 'MOVE_PADDLE';
    id: string;
    payload: { up: boolean; down: boolean };
};

export type MessageType =
    | ConnectType
    | MatchType
    | MovePaddleType;