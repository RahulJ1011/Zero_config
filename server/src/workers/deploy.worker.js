

const {Worker } = require('bullmq')
const { updateDeploymentStatus } = require('../db/queries/deployments')
const { updateAppStatus } = require('../db/queries/apps')
const { logger } = require('../utils/logger')
const {redis} = require('../config/redis')
const { generateCompose } = require('../services/compose')
const { sshService } = require('../services/ssh')
const { addCaddyRoute } = require('../services/caddy')
const { createDNSRecord } = require('../services/cloudfare')



const startDeployWorker = ()=>
{
    const worker = new Worker('deploy', async(job)=> {

        const {deploymentId, appId, appName, manifest, port} =  job.data
        logger.info("Deploy job started", appName)

        try
        {
            await updateDeploymentStatus(deploymentId,'building');
            await updateAppStatus(appId,'deploying')
             logger.info('Creating app folder', appName)

              logger.info('Copying files', appName)


              logger.info('Generating docker-compose.yml')

              const composeContent = generateCompose(appName,manifest,port)
              
              logger.debug('Generated COmpose file:\n', composeContent)
              
              await updateDeploymentStatus(deploymentId, 'deploying')

      logger.info('Deploying via ssh', appName)
        await sshService.deploy(appName, composeContent)

      logger.info('Registering subdomain', appName)
          await addCaddyRoute(appName, port)
      logger.info('Creating DNS record', appName)

      await createDNSRecord(appName)

       const url = `https://${appName}.ZeroConfig.dev`
            
        await updateDeploymentStatus(deploymentId, 'live',{
          logs: `Deployed succesfully at ${new Date().toISOString()}`
        })

        await updateAppStatus(appId, 'live', url)


         logger.info('Deployment complete', url)

      return { url, status: 'live', deploymentId }

    
    }

    catch(err)
    {
        logger.error('Deployment failed', err.message)

        await updateDeploymentStatus(deploymentId, 'failed', {
        errorMessage: err.message
      })
      await updateAppStatus(appId, 'failed')

      throw err
    }

    }, {connection: redis,
      concurrency: 3
    })

    worker.on('completed',(job)=> {
        logger.info('completed', job.id)
    })

    worker.on('failed', async(job, err) => {
    logger.error('Job failed', err.message)

    if(job?.data?.deploymentId)
    {
      try
      {
        await updateDeploymentStatus(
          job.data.deploymentId,
          'failed',
          {errorMessage: err.message}
        )

        await updateAppStatus(job.data.appId, 'failed'
        )
      }
      catch(err)
      {
        logger.error('Failed to update deployment status', err.message)
      }
    }
  })
 worker.on('error', (error) => {
    logger.error('Worker error', error.message)
  })

  logger.info('Deploy worker started')
  return worker
}

module.exports = {startDeployWorker}