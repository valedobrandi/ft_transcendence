
import { FastifyInstance, FastifyRequest } from 'fastify';
import { connectedRoomInstance } from '../state/ConnectedRoom'

export function logout(fastify: FastifyInstance)
{
    fastify.get('/logout', 
    {preHandler: [fastify.authenticate],
    handler: (async (request: FastifyRequest, res) => 
        {
            try 
            {
                const id = request.userId
                connectedRoomInstance.disconnect(id)
                return res.status(200).send({message: "success"});
            }
            catch (error) 
            {
                const err = error as Error;
                return res.status(404).send({ error: err.message });
            }
        })
    });
}