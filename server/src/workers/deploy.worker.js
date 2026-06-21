

const {Worker } = require('bullmq')
const { updateDeploymentStatus } = require('../db/queries/deployments')
const { updateAppStatus } = require('../db/queries/apps')
const { logger } = require('../utils/logger')




const startDeployWorker = ()=>
{
    const worker = new Worker('deploy', async(job)=> {

        const {deploymentId, appId, appName, manifest, port} =  job.data
        logger.info("Deploy job started", appName)

        try
        {
            await updateDeploymentStatus(deploymentId,'building');
             logger.info('Creating app folder', appName)

              logger.info('Copying files', appName)

              await updateDeploymentStatus(deploymentId, 'deploying')
      logger.info('Starting containers', appName)


      logger.info('Registering subdomain', appName)

      logger.info('Creating DNS record', appName)

       const url = `https://${appName}.ASRKing.dev`
            
        await updateDeploymentStatus(deploymentId, 'live')

        await updateAppStatus(appId, 'live', url)


         logger.info('Deployment complete', url)

      return { url, status: 'live' }

    
    }

    catch(err)
    {
        logger.error('Deployment failed', error.message)

        await updateDeploymentStatus(deploymentId, 'failed', {
        errorMessage: error.message
      })
      await updateAppStatus(appId, 'failed')

      throw error
    }

    }, {connection: redis})

    worker.on('completed',(job)=> {
        logger.info('completed', job.id)
    })

    worker.on('failed', (job, err) => {
    logger.error('Job failed', err.message)
  })

  return worker
}