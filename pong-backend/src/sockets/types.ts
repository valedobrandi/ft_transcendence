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

export type PlayType = {
    type: 'PLAY';
    id: string;
};

export type Tournamentype = {
    type: 'TOURNAMENT';
    id: string;
};

export type InputType = {
    type: 'input';
    id: string;
    payload: { up: boolean; down: boolean };
}

export type ChatType = {
    type: 'CHAT';
    from: string;
    to: string;
    message: string;
}


export type MessageType =
    | ConnectType
    | MatchType
    | MovePaddleType
    | PlayType
    | Tournamentype
    | InputType
    | ChatType;