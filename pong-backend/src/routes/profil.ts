import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProfileControler } from '../controllers/profileController.js';
import { getIdUser } from '../user_service/user_service.js';

export default function profilRoute(fastify: FastifyInstance)
{
    const profileController = new ProfileControler();

        fastify.get<{Querystring: { id: number }}>('/profile/user', {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' }
                    },
                    required: ['id']
                }
            },
            handler: profileController.getProfileById.bind(profileController)
        });


        fastify.get('/profile', {
            preHandler: [fastify.authenticate],
            handler: (async (request: FastifyRequest, res: FastifyReply) =>
            {
                try
                {

                    const id = request.userId;
                    const returnDB = getIdUser(id);
                    if(!returnDB)
                        return res.status(400).send({error: "error user not found"})
                    const existUser = {
                        avatar_url: returnDB.avatar_url,
                        email: returnDB.email,
                        username: returnDB.username,
                        id: returnDB.id,
                    }

                    return res.status(200).send({ message: 'success', existUser });
                }
                catch (error)
                {
                    const err = error as Error;
                    return res.status(404).send({ error: err.message });
                }
            })
        });

        fastify.put('/update', {
        preHandler: [fastify.authenticate],
        schema: {
            body: {
            type: 'object',
            properties: {
                username: { type: 'string', minLength: 3 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
                current_password: { type: 'string', minLength: 2 },
            },
            additionalProperties: false
            }
        }
        }, profileController.updateUser.bind(profileController));
}
