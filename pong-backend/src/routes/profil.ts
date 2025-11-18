import { FastifyInstance, FastifyRequest } from 'fastify';
import { ProfileControler } from '../controllers/profileController.js';

export default function profilRoute(fastify: FastifyInstance)
{
    const profileController = new ProfileControler();

        //http://localhost/profile?id=0
        fastify.get('/profile', {
            preHandler: [fastify.authenticate],
            handler: (async (request: FastifyRequest, res) => 
            {
                try 
                {
                    return res.status(200).send({ message: 'success', user: request.user });
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


