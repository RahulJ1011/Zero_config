const { getDeploymentId } = require('../db/queries/deployments')
const { deployHandler, getDeploymentsHandler, destroyHandler } = require('../handlers/deployments')
const {authMiddleware} = require('../middleware/auth')


const deploymentRoutes = async(fastify)=>
{
    fastify.addHook('preHandler', authMiddleware)

    fastify.post('/deploy', deployHandler)

    fastify.post('/destroy', destroyHandler)

    fastify.get('/deployments/:id',getDeploymentsHandler)

    fastify.get('/jobs/:jobId', async (request, reply) => {

    const job = await deployQueue.getJob(request.params.jobId)

    if (!job) {
      return reply.status(404).send({ error: 'Job not found' })
    }

    const state = await job.getState()

    return {
      jobId:    job.id,
      status:   state,
      result:   job.returnvalue  || null,
      error:    job.failedReason || null,
      progress: job.progress     || 0,
    }
  })
}

module.exports = {deploymentRoutes}