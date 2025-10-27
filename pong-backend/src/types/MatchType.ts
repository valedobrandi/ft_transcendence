import { matchStatus } from "../enum_status/enum_matchStatus.js";

export type Match = 
{
    match_id: number;
    player1_id: number;
    player2_id: number;
    score_player1: number | null;
    score_player2: number | null;
    id_winner: number;
    status: matchStatus;
    created_at: string;
};

export type MatchBody =
{
    match_id: number;
    score_player1: number;
    score_player2: number;
    player1_id: number;
    player2_id: number;
};