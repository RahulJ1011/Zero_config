const Fastify = require('fastify')
const jwt = require('@fastify/jwt')
const cors = require('@fastify/cors')

const {logger} =  require('./utils/logger')
const { validateConfig, config } = require('./config')
const { registerRoutes } = require('./routes')
const { startDeployWorker } = require('./workers/deploy.worker')
const { errorHandler } = require('./middleware/errors')


const startServer = async()=>
{

    validateConfig();

    const app = Fastify({
        logger:false
    })

    await app.register(cors,{
        origin: true
    })


    await app.register(jwt,{
        secret: config.jwtSecret
    }) 

    await registerRoutes(app)

    app.setErrorHandler(errorHandler)

    app.get('/health', async () => {
    return {
      status:  'ok',
      version: '0.1.0',
      time:    new Date().toISOString()
    }
  })

  startDeployWorker();
  logger.info("Deploy worker started")

  await app.listen({
    port: config.port,
    host: '0.0.0.0'
  })

  logger.info(`Server running on port ${config.port}`)

  logger.info(`Environment: ${config.nodeEnv}`)
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})