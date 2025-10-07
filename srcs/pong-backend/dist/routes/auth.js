import bcrypt from 'bcrypt';
import db from '../db.js';
export default async function authRoutes(fastify) {
    fastify.post('/register', async (request, reply) => {
        const { email, username, password } = request.body;
        if (!email || !username || !password)
            return reply.status(400).send({ error: 'all fields are mandatory' });
        const InstructionDBforFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        const existingUser = InstructionDBforFindUser.get(email, username);
        if (existingUser) {
            if (existingUser.email === email)
                return reply.status(400).send({ error: 'Email already in use' });
            if (existingUser.username === username)
                return reply.status(400).send({ error: 'Username already in use' });
        }
        const hash = await bcrypt.hash(password, 10);
        const insertNewUserInDB = db.prepare('INSERT INTO users (email, username, password) VALUES (?,?,?)');
        insertNewUserInDB.run(email, username, hash);
        return reply.status(201).send({ message: 'User created successfully' });
    });
    fastify.post('/login', async (request, reply) => {
        const { email, username, password } = request.body;
        if (!email || !username || !password)
            return reply.status(400).send({ error: 'all fields are mandatory' });
        const InstructionDBforFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        const existingUser = InstructionDBforFindUser.get(email, username);
        if (existingUser === undefined)
            return reply.status(400).send({ error: 'Error user not found' });
        return reply.status(201).send({ message: 'user connected' });
    });
}
