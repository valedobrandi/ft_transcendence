import { FastifyRequest, FastifyInstance } from "fastify";
import { User } from '../types/RegisterType.js';
import db from '../db.js';


export default function friend(fastify: FastifyInstance)
{
    //add friend
    fastify.post('/user/:id/friends', (request: FastifyRequest<{Params: {id: string}, Body: {friend_id: string}}>, reply) => 
    {
        const user_id = Number(request.params.id);
        const friend_id = Number(request.body.friend_id);
        console.log("USER ",user_id);
        console.log("FRIEND ", friend_id);
        
        const existIdUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id) as User;
        const existIdFriend = db.prepare("SELECT * FROM users WHERE id = ?").get(friend_id) as User;

        if(!existIdUser || !existIdFriend)
            return reply.status(404).send({message: "user or friend not found"});

        const checkUserAlreadyFriend = db.prepare("SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (friend_id = ? AND user_id = ?)").get(user_id, friend_id, friend_id, user_id);
        if(checkUserAlreadyFriend)
            return reply.status(404).send({error: "friend exist already"});

        db.prepare("INSERT INTO friends (user_id, friend_id) VALUES (?, ?)").run(user_id , friend_id);

        return reply.status(201).send({ message: `${existIdUser.username} and ${existIdFriend.username} are now friends!` });
    });

    //display all friends of a user
    fastify.get('/user/:id/friends', (request: FastifyRequest<{Params: {id: string}}> , reply) => 
    {   
        const id = Number(request.params.id);

        const existIdUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        if(!existIdUser)
            return reply.status(404).send({error: "User not found"});

        const friends = db.prepare(`
        SELECT u.id, u.username, u.status
        FROM users u
        JOIN friends f ON (u.id = f.friend_id AND f.user_id = ?)
        UNION
        SELECT u.id, u.username, u.status
        FROM users u
        JOIN friends f ON (u.id = f.user_id AND f.friend_id = ?)
        `).all(id, id);

        return reply.status(200).send({ friends });
    });
}