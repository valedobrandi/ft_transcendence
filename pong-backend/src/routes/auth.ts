import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { RegisterBody, User } from '../types/RegisterType.js';
import { getIdUser, updatedUserInDB } from '../user_service/user_service.js';
import { playerStatus } from '../enum_status/enum_userStatus.js';

import db from '../db.js';

export default async function authRoutes(fastify: FastifyInstance)
{
  //register user
  fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply) => {
    const { email, username, password } = request.body;

    if(!email || !username || !password)
      return reply.status(400).send({error: 'all fields are mandatory'});

    const InstructionDBforFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?')
    const existingUser = InstructionDBforFindUser.get(email, username) as User | undefined;
    if (existingUser)
    {
      if(existingUser.email === email)
        return reply.status(400).send({error: 'Email already in use'})
      if(existingUser.username === username)
        return reply.status(400).send({error: 'Username already in use'})
    }

    const hash = await bcrypt.hash(password, 10);

    const insertNewUserInDB = db.prepare('INSERT INTO users (email, username, password) VALUES (?,?,?)');
    insertNewUserInDB.run(email, username, hash);

    return reply.status(201).send({message: 'User created successfully'});
  });




  //login user
  fastify.post('/login', async (request: FastifyRequest<{ Body: RegisterBody}>, reply) => {
    const { email, username, password } = request.body;

    if(!email || !username || !password)
      return reply.status(400).send({error: 'all fields are mandatory'})

    const InstructionDBforFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?')
    const existingUser = InstructionDBforFindUser.get(email, username) as User | undefined;

    if (existingUser=== undefined)
      return reply.status(400).send({error: 'Error user not found'})

    return reply.status(201).send({message: 'user connected'});
  });

  //update user
  fastify.put('/user/:id', async(request: FastifyRequest<{ Params : {id : number }, Body : RegisterBody }>, reply) =>
  {
    const { email, username, password} = request.body;
    const { id } = request.params;

    const player = getIdUser(id);
    if (!player)
      return reply.status(404).send({error: 'user not found'});
    

    console.log(player.status, ' AND ', playerStatus.DISCONNECT.toString());
    if(player.status === playerStatus.DISCONNECT.toString())
    {

      return reply.status(400).send({error: 'Player Disconnected'});
    }

    
    player.email = email ?? player.email;
    player.username = username ?? player.username;

  
    if (password)
    {
      const hash = await bcrypt.hash(password, 10);
      player.password = hash;
      console.log("change mot de pass");
    }

    try
    {
      updatedUserInDB(player);
      return reply.status(200).send({message: 'Profile updated successfully', user: player});
    }
    catch (error)
    {
      const err = error as Error;
      return reply.status(404).send({error: err.message });
    }
  });

  //disconnect user
  fastify.put('/logout/:id', (request: FastifyRequest<{Params: {id: string }}>, reply) =>
  {
    const { id } = request.params;
    const idUser = Number(id);

    if(!idUser)
      return reply.status(404).send({error: "id not found"});

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(playerStatus.DISCONNECT, idUser);
    return reply.status(200).send({message: "User disconnected"});
  });

  //get info user + all match playing
  fastify.get('/user/:id', (request: FastifyRequest<{Params: {id: string}}>, reply) =>
  {
    const { id } = request.params;
    const UserId = Number(id);

     if(!id)
      return reply.status(404).send({error: "ID not found"});

    const searchUser = db.prepare('SELECT * from users WHERE id = ?')
    const displayUser = searchUser.get(UserId);

    if (!displayUser)
      return reply.status(404).send({error : "user not found"});

    const getStatMatchUser = db.prepare('SELECT * from matches WHERE player1_id = ? OR player2_id = ? ORDER BY created_at DESC');
    const displayMatchUser = getStatMatchUser.all(UserId, UserId);

    return reply.status(200).send({user: displayUser, matches: displayMatchUser});
  });
}