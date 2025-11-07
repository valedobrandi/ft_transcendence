import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { RegisterBody, User } from '../types/RegisterType.js';
import { getIdUser, updatedUserInDB } from '../user_service/user_service.js';
import db from '../../database/db.js'
import { playerStatus } from '../enum_status/enum_userStatus.js';
import { ProfileControler } from '../controllers/profileController.js';


export default function profilRoute(fastify: FastifyInstance)
{
    const profileController = new ProfileControler();

        //http://localhost/profile?id=0
        fastify.get('/profile', {
            preHandler: [fastify.authenticate],
            handler: (async (request: FastifyRequest, res) => {
              

                try {
                    return res.status(200).send({ message: 'success', user: request.user });
                }
                catch (error) {
                    const err = error as Error;
                    return res.status(404).send({ error: err.message });
                }

            })
        });

    fastify.put('/update', {
        preHandler: [fastify.authenticate],
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                    email: {type: 'string'},
                    password: {type: 'string'}
            
           },
           required: ['username', 'email', 'password'],
        },
        handler: profileController.updateUser.bind(profileController)
        })
    }


// fastify.put('/profil/update/:id', async (request: FastifyRequest<{ Params: { id: number }, Body: RegisterBody }>, res) => {
//     const { email, username, password } = request.body;
//     const { id } = request.params;

//     const player = getIdUser(id);
//     if (!player)
//         return res.status(404).send({ error: 'user not found' });

//     player.email = email ?? player.email;
//     player.username = username ?? player.username;

//     if (password) {
//         const hash = await bcrypt.hash(password, 10);
//         player.password = hash;
//         console.log("change mot de pass");
//     }

//     try {
//         updatedUserInDB(player);
//         return res.status(200).send({ message: 'Profile updated successfully', user: player });
//     }
//     catch (error) {
//         const err = error as Error;
//         return res.status(404).send({ error: err.message });
//     }
// });


