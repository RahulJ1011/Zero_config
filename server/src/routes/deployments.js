const { getDeploymentId } = require('../db/queries/deployments')
const { deployHandler, getDeploymentsHandler } = require('../handlers/deployments')
const {authMiddleware} = require('../middleware/auth')


const deploymentRoutes = async(fastify)=>
{
    fastify.addHook('preHandler', authMiddleware)

    fastify.post('/deploy', deployHandler)

    fastify.get('/deployments/:id',getDeploymentsHandler)
}

module.exports = {deploymentRoutes}