import Database from 'better-sqlite3'
const db = new Database('/home/jelecoq/Documents/Project-Transcendance/pong-backend/database.db')

const usersWithMatches = db.prepare(`
  SELECT 
    m.match_id AS match_id,
    u1.username AS player1,
    u2.username AS player2,
    m.score1,
    m.score2,
    CASE 
      WHEN m.winner_id = u1.id THEN u1.username
      WHEN m.winner_id = u2.id THEN u2.username
      ELSE 'No winner yet'
    END AS winner
  FROM matches m
  JOIN users u1 ON m.player1_id = u1.id
  JOIN users u2 ON m.player2_id = u2.id
`).all();

console.table(usersWithMatches);
 