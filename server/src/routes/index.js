
const {authRoutes} =  require('./auth')
const {deploymentRoutes} = require('./deployments')
const {appRoutes} = require('./apps')


export async function registerRoutes(fastify)
{
    fastify.register(authRoutes)
    fastify.register(appRoutes)
    fastify.register(deploymentRoutes)
}