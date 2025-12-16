import { playerStatus } from '../enum_status/enum_userStatus.js';
import { User } from '../types/RegisterType.js';
import db from '../database/db.js';

export function getIdUser(id: number): User | null 
{
    const findPlayer = db.prepare('SELECT * FROM users WHERE id = ?');
    const player = findPlayer.get(id) as User | undefined;

    return player ?? null;
}

export function updatedUserInDB(user : User): void
{ 
    const findIdUser = db.prepare('SELECT * from users WHERE id = ?');
    const IdFound = findIdUser.get(user.id);

    if(!IdFound)
        throw new Error('User not found');

    const updateUser = db.prepare(`
    UPDATE users
    SET 
      email = ?,
      username = ?,
      password = ?,
      updated_at = date('now')
    WHERE id = ?
  `);

  updateUser.run(
    user.email,
    user.username,
    user.password,
    user.id
  );
}
