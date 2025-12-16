import { playerStatus } from '../enum_status/enum_userStatus.js';
import { User } from '../types/RegisterType.js';
import db from '../database/db.js';
import bcrypt from 'bcrypt';

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

export function updateUsername(username:string, id: number) {
    const stm = db.prepare('UPDATE users SET username = ? WHERE id = ?');
    stm.run(username, id)
}

export function updateEmail(email:string, id: number) {
    const stm = db.prepare('UPDATE users SET email = ? WHERE id = ?');
    stm.run(email, id)
}

export async function updatePassword(password:string, id: number) {
    const hash = await bcrypt.hash(password, 10)
    const stm = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    stm.run(hash, id)
}
