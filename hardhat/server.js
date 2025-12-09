import {contractReadOnly , contractWithSigner } from "./blockchain.js";
import fastifyCors from '@fastify/cors';
import Fastify from 'fastify'


const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/health', async function handler(request, response) {
  try {
    const provider = contractReadOnly.provider
    const code = await provider.getCode(contractReadOnly.target)

    if (code === '0x') {
      // Contract not deployed yet
      return response.status(503).send({ message: 'contract_not_deployed' })
    }

    return response.status(200).send({ message: 'OK' })
  } catch (err) {
    fastify.log.error(err)
    return response.status(500).send({ message: 'error_checking_contract' })
  }
})

await fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
});

fastify.get('/hardhat/:matchId', {
  schema: {
    params: {
      type: 'object',
      properties: {
        matchId: { type: 'string' }
      },
      required: ['matchId']
    }
  }
}, async function handler(request, response) {
  const { matchId } = request.params;
  try {
    const node = await contractReadOnly.getMatch(matchId);
		const [score1, score2] = node;
    return response.status(200).send({ matchId, score1: Number(score1), score2: Number(score2) });
  } catch (error) {
    return response.status(500).send({ message: 'error_fetching_match.', error: error.message });
  }
})

fastify.post('/hardhat', {
  schema: {
    body: {
      type: 'object',
      properties: {
        matchId: { type: 'string' },
        score1: { type: 'integer' },
        score2: { type: 'integer' }
      },
      required: ['matchId', 'score1', 'score2']
    }
  }
}, async function handler(request, response) {
  const { matchId, score1, score2 } = request.body;
  try {
    const tx = await contractWithSigner.saveMatch(matchId, score1, score2);
    await tx.wait();
    return response.status(200).send({ message: 'match_saved' });
  } catch (error) {
    return response.status(500).send({ message: 'error_saving_match.', error: error.message });
  }

})

// Run the server!
try {
  await fastify.listen({ port: 3300, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}