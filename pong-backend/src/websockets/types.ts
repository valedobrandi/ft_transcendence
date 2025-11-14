export type ConnectType = {
    type: 'CONNECT';
    username: string;
	userId: number;
};

export type MatchType = {
    type: 'MATCH';
    username: string;
    id: string;
};

export type MovePaddleType = {
    type: 'MOVE_PADDLE';
    username: string;
    payload: { up: boolean; down: boolean };
};

export type PlayType = {
    type: 'PLAY';
    username: string;
};

export type Tournamentype = {
    type: 'TOURNAMENT';
    username: string;
};

export type InputType = {
    type: 'input';
    username: string;
    payload: { up: boolean; down: boolean };
}

export type ChatType = {
    type: 'CHAT';
    senderId: number;
    sender: string;
    receiverId: number;
    receiver: string;
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