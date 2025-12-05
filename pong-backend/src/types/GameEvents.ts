import { SettingsType } from "./GameStateType";

export type EventsMap = {
    'game:savehistory': {
        matchId: string;
        player1: string;
        player2: string;
        score1: number;
        score2: number;
    },
    'game:start': {
        matchId: string;
        oponentes: [string, string];
        settings: SettingsType | undefined;
    }
}

