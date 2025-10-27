import { FastifyRequest, FastifyInstance } from "fastify";
import { matchStatus } from "../enum_status/enum_matchStatus.js";
import {MatchBody, Match} from "../types/MatchType.js";
import db from '../db.js'

export default function matchRoute(fastify: FastifyInstance)
{
    fastify.post('/match', (request: FastifyRequest<{Body: MatchBody}>, reply) => 
    {
        const {player1_id, player2_id} = request.body;

        const existPlayer1 = db.prepare("SELECT * FROM users WHERE id = ?").get(player1_id);
        const existPlayer2 = db.prepare("SELECT * FROM users WHERE id = ?").get(player2_id);

        if (!existPlayer1)
            return reply.status(404).send({error: "player1 not found"});
        if (!existPlayer2)
            return reply.status(404).send({error: "player2 not found"});

        
        const createMatch = db.prepare(`INSERT INTO matches (player1_id, player2_id, match_status) VALUES (?, ?, ?)`);
       
        const result = createMatch.run(player1_id, player2_id, matchStatus.WAITING);

        db.prepare('UPDATE users SET status = ? WHERE id IN (?, ?)').run(matchStatus.IN_GAME, player1_id, player2_id);

        return reply.status(201).send({ message: 'Match created', match_id: result.lastInsertRowid });
    });

    fastify.put('/match', (request: FastifyRequest<{ Body: { match_id: number, score_player1: number, score_player2: number } }>, reply) =>
    {
        const { match_id, score_player1, score_player2 } = request.body;

        const existMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(match_id)  as Match;
        console.log(existMatch);
        if (!existMatch)
        return reply.status(404).send({ error: 'Match not found' });

        let winner_id: number | null = null;
        if (score_player1 > score_player2)
            winner_id = existMatch.player1_id;
        else if (score_player2 > score_player1) 
            winner_id = existMatch.player2_id;
        console.log(existMatch);
       
        db.prepare(`
        UPDATE matches
        SET score1 = ?, score2 = ?, winner_id = ?, match_status = ?
        WHERE id = ?
        `).run(score_player1, score_player2, winner_id, matchStatus.FINISHED, match_id);
        
        if (winner_id)
        {
            const loser_id = winner_id === existMatch.player1_id ? existMatch.player2_id : existMatch.player1_id;
            db.prepare('UPDATE users SET wins = wins + 1 WHERE id = ?').run(winner_id);
            db.prepare('UPDATE users SET losses = losses + 1 WHERE id = ?').run(loser_id);
        }

        db.prepare('UPDATE users SET status = ? WHERE id IN (?, ?)')
        .run(matchStatus.WAITING, existMatch.player1_id, existMatch.player2_id);

        return reply.status(200).send({
        message: 'Update successfully',
        match_id,
        score_player1,
        score_player2,
        winner_id
        });
  });
}