
import db from "./db.js";
import bcrypt from 'bcrypt';

export function existUser(email, username)
{
    const FindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?') //
    const existingUser = FindUser.get(email, username); //as User | undefined;
    return existingUser;
    }	

export async function hashPassword(password)
{
    return await bcrypt.hash(password, 10);
}

export function InsertInfo(email, username, hash)
{
    const insertNewUserInDB = db.prepare('INSERT INTO users (email, username, password) VALUES (?,?,?)');
    insertNewUserInDB.run(email, username, hash);
}