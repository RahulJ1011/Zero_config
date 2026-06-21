const {nanoid} = require('nanoid')

const {Queue} =  require('bullmq');
const { getAppById } = require('../db/queries/apps');
const { findFreePort } = require('../utils/port');
const { createDeployment, getDeploymentId } = require('../db/queries/deployments');
const { logger } = require('../utils/logger');



const deployQueue = new Queue('deploy',{
    connection: redis
})

const deployHandler = async(req,res)=>
{
    const {appId, manifest} = req.body;

    const app = getAppById(appId);
    if(!app)
    {
        return res.status(404).send({
            msg:"App not found"
        })

    }

    if(app.userId!==req.userId)
    {
        return res.status(401).send({
            error:"Access denied"
        })
    }

    const port = findFreePort(3000);

    const deployment = await createDeployment({
        id: 'deploy'+nanoid(12),
        appId: app.id,
        status:"queued"
    })

     const job = await deployQueue.add('deploy', {
    deploymentId: deployment.id,
    appId:        app.id,
    appName:      app.name,
    manifest,
    port,
  })

  logger.info("Deployment Queued",app.name)


  return res.status(200).send({
    message: 'Deployment started',
    deploymentID: deployment.id,
    jobId: job.id,
    status: 'queued'
  })
}


const getDeploymentsHandler = async(req,res)=>
{
    const deployment = await getDeploymentId(req.params.id)

    if(!deployment)
    {
        return res.status(404).send({error:"Deployments not found"})
    }

    return res.status(200).send({
        deployment
    })
}


module.exports = {getDeploymentsHandler,deployHandler}