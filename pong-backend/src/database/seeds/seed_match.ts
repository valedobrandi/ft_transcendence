import db from '../db.js';

const  matches = [
	{
		match_id: '1',
		player1: 'lola',
		player2: 'charlie123',
		score1: 3,
		score2: 2,
	},
    {
		match_id: '2',
		player1: 'lola',
		player2: 'charlie123',
		score1: 5,
		score2: 2,
	},
    {
		match_id: '3',
		player1: 'lola',
		player2: 'charlie123',
		score1: 1,
		score2: 6,
	},
    {
		match_id: '4',
		player1: 'bobMarley',
		player2: 'proGamer',
		score1: 1,
		score2: 6,
	},
	{
		match_id: '4',
		player1: 'bobMarley',
		player2: 'lola',
		score1: 1,
		score2: 6,
	},
	
];

export async function seedMatch() {
	const insertUser = db.prepare(`
    INSERT INTO matches (match_id, player1)
    VALUES (@match_id, @player1, @player2)
  `);
	const insertMany = db.transaction((matches) => {
		for (const user of matches) insertUser.run(user);
	});

	insertMany(matches);
}

