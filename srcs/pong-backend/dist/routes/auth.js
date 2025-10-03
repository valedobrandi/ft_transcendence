import bcrypt from 'bcrypt';
import { users, saveUsers } from '../data/users.js';
export default async function authRoutes(fastify) {
    fastify.post('/register', async (request, reply) => {
        const { email, username, password } = request.body;
        // Vérification des doublons
        if (users.find(u => u.email === email))
            return reply.status(400).send({ error: 'Email really use' });
        if (users.find(u => u.username === username))
            return reply.status(401).send({ error: 'Username really use' });
        // Hachage du mot de passe
        const hash = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            email,
            username,
            password: hash,
        };
        users.push(newUser);
        saveUsers();
        return { message: 'User create :', user: { id: newUser.id, username: newUser.username } };
    });
}
