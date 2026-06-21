
const {authRoutes} =  require('./auth')
const {deploymentRoutes} = require('./deployments')
const {appRoutes} = require('./apps')


 async function registerRoutes(fastify)
{
    fastify.register(authRoutes)
    fastify.register(appRoutes)
    fastify.register(deploymentRoutes)
}

module.exports = {registerRoutes}